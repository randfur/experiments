const nan = 0 / 0;
const u32Bytes = 4;
const f32Bytes = 4;
const vec3Bytes = f32Bytes * 3;
const vec4Bytes = f32Bytes * 4;

const maxParticleCount = 100;
const maxMassCount = 2;
const maxSimulationStepCount = 1000;
const meshIndexCount = (maxParticleCount - 1) * (maxSimulationStepCount * 2);
const simulationTimeStep = 0.01;
const workgroupSize = 64;
const zoom = 0.25;

const massBytes = vec4Bytes + vec4Bytes;
const particleBytes = vec4Bytes + vec4Bytes + vec4Bytes;
const trajectoryPointBytes =  vec4Bytes + vec4Bytes;
const trajectoryBytes = trajectoryPointBytes * maxSimulationStepCount;

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

  const trajectoriesBuffer = device.createBuffer({
    size: trajectoryBytes * maxParticleCount,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
  });

  const meshIndexBuffer = device.createBuffer({
    size: u32Bytes * meshIndexCount,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.INDEX,
  });

  // const zoomBuffer = device

  const shaderModule = device.createShaderModule({
    code: `
      override maxMassCount: u32;
      override maxParticleCount: u32;
      override maxSimulationStepCount: u32;
      override simulationTimeStep: f32;

      const zoom: f32 = ${zoom};

      struct Particle {
        position: vec4f,
        velocity: vec4f,
        colour: vec4f,
      }

      struct Mass {
        position: vec4f,
        size: vec4f
      }

      struct TrajectoryPoint {
        @location(0) position: vec4f,
        @location(1) colour: vec4f,
      }

      @group(0) @binding(0) var<storage, read> particles: array<Particle>;
      @group(0) @binding(1) var<storage, read> masses: array<Mass>;
      @group(0) @binding(2) var<storage, read_write> trajectories: array<TrajectoryPoint>;
      @group(0) @binding(3)

      @compute @workgroup_size(${workgroupSize})
      fn simulate(@builtin(global_invocation_id) id: vec3u) {
        let particleIndex = id.x;
        if (particleIndex >= maxParticleCount) {
          return;
        }
        var particle = particles[particleIndex];
        let trajectoryIndexStart = particleIndex * maxSimulationStepCount;

        for (var i: u32 = 0; i < maxSimulationStepCount; i += 1) {
          for (var j: u32 = 0; j < maxMassCount; j += 1) {
            let delta = masses[j].position - particle.position;
            particle.velocity += delta * masses[j].size.x / dot(delta, delta) * simulationTimeStep;
          }

          particle.position += particle.velocity * simulationTimeStep;

          trajectories[trajectoryIndexStart + i] = TrajectoryPoint(
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
          vec4f((trajectoryPoint.position * zoom).xyz, 1),
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
        maxParticleCount,
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
        buffer: trajectoriesBuffer,
      },
    }],
  });

  const trajectoryRenderPipeline = device.createRenderPipeline({
    layout: 'auto',
    primitive: {
      topology: 'triangle-strip',
      stripIndexFormat: 'uint32',
    },
    vertex: {
      module: shaderModule,
      entryPoint: 'vertex',
      buffers: [{
        arrayStride: trajectoryPointBytes,
        attributes: [{
          shaderLocation: 0,
          format: 'float32x4',
          offset: 0,
        }, {
          shaderLocation: 1,
          format: 'float32x4',
          offset: vec4Bytes,
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
            dstFactor: 'one',
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
    meshIndexBuffer,
    0,
    new Uint32Array(
      range(maxParticleCount - 1).map(i => [
        range(maxSimulationStepCount).map(j => [
          i * maxSimulationStepCount + j,
          (i + 1) * maxSimulationStepCount + j,
        ]),
        // 0xFFFFFFFF,
      ]).flat(Infinity),
      2,
      4,
    ),
  );

  while (true) {
    const time = await new Promise(requestAnimationFrame);

    device.queue.writeBuffer(
      massBuffer,
      0,
      new Float32Array(range(maxMassCount).flatMap(i => [
        3 * Math.cos(time / 10000 + i * 10), 3 * Math.sin(time / 10000 + i * 10), 3 * Math.cos(time / 10000 + i * 4), 0,
        10, 0, 0, 0
      ])),
    );

    device.queue.writeBuffer(
      particleBuffer,
      0,
      new Float32Array(range(maxParticleCount).flatMap(i => [
        0, 0, 0, 0,
        Math.cos(i / 2), Math.sin(i / 2), 0, 1,
        0.2, 0.02, 0.01, 0.5,
      ])),
    );

    const commandEncoder = device.createCommandEncoder();

    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(trajectorySimulationPipeline);
    computePass.setBindGroup(0, trajectorySimulationBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(maxParticleCount / workgroupSize));
    computePass.end();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        loadOp: 'load',
        storeOp: 'store',
        view: context.getCurrentTexture().createView(),
      }],
    });
    renderPass.setPipeline(trajectoryRenderPipeline);
    renderPass.setVertexBuffer(0, trajectoriesBuffer);
    renderPass.setIndexBuffer(meshIndexBuffer, 'uint32');
    renderPass.drawIndexed(meshIndexCount);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
  }
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function incrementToMultiple(x, n) {
  while (x % n !== 0) {
    ++x;
  }
  return x;
}

function padToMultiple(list, elementSize, n) {
  const result = [...list];
  while ((result.length * elementSize) % n !== 0) {
    result.push(0);
  }
  return result;
}

main();