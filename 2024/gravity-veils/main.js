const f32Bytes = 4;
const vec3Bytes = f32Bytes * 3;
const vec4Bytes = f32Bytes * 4;

const maxMassCount = 10;
const maxParticleCount = 1000;
const maxSimulationStepCount = 1000;

const massBytes = vec3Bytes + f32Bytes;
const particleBytes = vec3Bytes + vec3Bytes + vec4Bytes;
const trajectoryPointBytes = vec3Bytes + vec4Bytes;
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

  const trajectoryBuffer = device.createBuffer({
    size: trajectoryBytes * maxParticleCount,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
  });

  const shaderModule = device.createShaderModule({
    code: `
      const maxParticleCount: u32;
      const maxMassCount: u32;
      const maxSimulationStepCount: u32;
      const simulationTimeStep: f32;

      struct Particle {
        vec3f position,
        vec3f velocity,
        vec4f colour,
      }

      struct Mass {
        vec3f position,
        f32 size,
      }

      struct TrajectoryPoint {
        vec3f position,
        vec4f colour,
      }

      alias Trajectory = array<TrajectoryPoint, maxSimulationStepCount + 1>;

      @group(0) @binding(0) var<storage, read> particles: array<Particle, maxParticleCount>;
      @group(0) @binding(1) var<storage, read> masses: array<Mass, maxMassCount>;
      @group(0) @binding(2) var<storage, write> trajectories: array<Trajectory, maxParticleCount>;

      @compute @workgroup_size(64)
      fn simulate(@builtin(global_invocation_id) id: vec3u) {
        let particleIndex = id.x;
        let particle = particles[particleIndex];

        trajectories[particleIndex][0] = TrajectoryPoint{
          position: particle.position,
          colour: particle.colour,
        };

        for (let i: u32 = 0; i < maxSimulationStepCount; ++i) {
          for (let j: u32 = 0; j < maxMassCount; ++j) {

          }


          trajectories[particleIndex][i + 1] = TrajectoryPoint{
            position: particle.position,
            colour: particle.colour,
          };
        }
      }
    `,
  });
}

main();