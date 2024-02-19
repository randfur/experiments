const f32Bytes = 4;
const vec3Bytes = f32Bytes * 3;
const vec4Bytes = f32Bytes * 4;

const maxParticleCount = 1000;
const maxMassCount = 10;
const maxSimulationStepCount = 1000;
const simulationTimeStep = 1;

const massBytes = vec3Bytes + f32Bytes;
const particleBytes = vec3Bytes + vec3Bytes + vec4Bytes;
const trajectoryPointBytes = vec3Bytes + vec4Bytes;
const trajectoryBytes = trajectoryPointBytes * (maxSimulationStepCount + 1);

async function main() {
  document.body.style = `
    background-color: black;
    padding: 0;
    margin: 0;
    overflow: hidden;
  `;
  const canvas = document.createElement('canvas');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  document.body.append(canvas);
  const context = canvas.getContext('webgpu');

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  const massBuffer = device.createBuffer({
    size: massBytes * maxMassCount,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
  });

  const particleBuffer = device.createBuffer({
    size: particleBytes * maxParticleCount,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
  });

  const trajectoryBuffer = device.createBuffer({
    size: trajectoryBytes * maxParticleCount,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
  });

  const shaderModule = device.createShaderModule({
    code: `
      override maxMassCount: u32;
      override maxSimulationStepCount: u32;
      override simulationTimeStep: f32;

      struct Particle {
        position: vec3f,
        velocity: vec3f,
        colour: vec4f,
      }

      struct Mass {
        position: vec3f,
        size: f32,
      }

      struct TrajectoryPoint {
        @location(0) position: vec3f,
        @location(1) colour: vec4f,
      }

      @group(0) @binding(0) var<storage, read> particles: array<Particle>;
      @group(0) @binding(1) var<storage, read> masses: array<Mass>;
      @group(0) @binding(2) var<storage, read_write> trajectories: array<TrajectoryPoint>;

      @compute @workgroup_size(64)
      fn simulate(@builtin(global_invocation_id) id: vec3u) {
        let particleIndex = id.x;
        var particle = particles[particleIndex];
        let trajectoryIndexStart = particleIndex * (maxSimulationStepCount + 1);

        trajectories[trajectoryIndexStart] = TrajectoryPoint(
          particle.position,
          particle.colour,
        );

        for (var i: u32 = 0; i < maxSimulationStepCount; i += 1) {
          for (var j: u32 = 0; j < maxMassCount; j += 1) {
            let delta = masses[j].position - particle.position;
            particle.velocity += delta * masses[j].size / dot(delta, delta) * simulationTimeStep;
          }

          particle.position += particle.velocity * simulationTimeStep;

          trajectories[trajectoryIndexStart + 1] = TrajectoryPoint(
            particle.position,
            particle.colour,
          );
        }
      }

      struct Vertex {
        @builtin(position) position: vec4f,
        @location(0) colour: vec4f,
      }

      @vertex
      fn vertex(trajectoryPoint: TrajectoryPoint) -> Vertex {
        return Vertex(
          vec4f(trajectoryPoint.position, 1),
          trajectoryPoint.colour,
        );
      }

      @fragment
      fn fragment(@location(0) colour: vec4f) -> @location(0) vec4f {
        return colour;
      }
    `,
  });

  const trajectorySimulationPipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      constants: {
        maxMassCount,
        maxSimulationStepCount,
        simulationTimeStep,
      },
      entryPoint: 'simulate',
      module: shaderModule,
    },
  });

  const trajectorySimulationBindGroup = device.createBindGroup({
    layout: trajectorySimulationPipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: {
        buffer: particleBuffer,
      },
    }, {
      binding: 1,
      resource: {
        buffer: massBuffer,
      },
    }, {
      binding: 2,
      resource: {
        buffer: trajectoryBuffer,
      },
    }],
  });

  const trajectoryRenderPipeline = device.createRenderPipeline({
    layout: 'auto',
    primitive: {
      topology: 'triangle-strip',
    },
    vertex: {
      module: shaderModule,
      entryPoint: 'vertex',
      buffers: [{
        arrayStride: trajectoryPointBytes,
        attributes: [{
          shaderLocation: 0,
          format: 'float32x3',
          offset: 0,
        }, {
          shaderLocation: 1,
          format: 'float32x4',
          offset: vec3Bytes,
        }],
      }],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragment',
      targets: [{
        blend: {
          color: {
            operation: 'add',
            srcFactor: 'src-alpha',
            dstFactor: 'one-minus-src-alpha',
          },
          alpha: {
            operation: 'add',
            srcFactor: 'one',
            dstFactor: 'one',
          },
        },
        format: navigator.gpu.getPreferredCanvasFormat(),
      }],
    },
  });

  device.queue.writeBuffer(
    particleBuffer,
    0,
    new Float32Array(range(maxParticleCount).flatMap(i => [
      Math.cos(i / 1000),
      Math.sin(i / 1000),
      0,
      1,
      1,
      1,
      1,
    ])),
  );
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

main();