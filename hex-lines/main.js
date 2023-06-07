const gapNumber = 12345678;

async function main() {
  // Data
  const scale = 2;
  const width = Math.ceil(window.innerWidth / scale);
  const height = Math.ceil(window.innerHeight / scale);
  const size = 10;
  const length = 20;
  const points = new Float32Array(length * 2 + 1);
  for (let i = 0; i < length; ++i) {
    points[i * 2 + 0] = width / 2 + deviate(width / 2);
    points[i * 2 + 1] = height / 2 + deviate(height / 2);
  }
  points[1 * 2 + 0] = gapNumber;
  points[4 * 2 + 0] = gapNumber;
  points[Math.floor(length / 2) * 2 + 0] = gapNumber;
  points[length * 2 + 0] = gapNumber;

  // DOM
  document.body.style = `
    background-color: black;
    padding: 0;
    margin: 0;
    overflow: hidden;
  `;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style = `
    transform: scale(${scale});
    transform-origin: top left;
    image-rendering: pixelated;
  `;
  document.body.append(canvas);
  const context = canvas.getContext('webgpu');

  // WebGPU
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  window.device = device;
  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  const module = device.createShaderModule({
    code: `
      struct Uniforms {
        width: f32,
        height: f32,
        size: f32,
        colour: vec3f,
      }

      @group(0) @binding(0) var<uniform> uniforms: Uniforms;

      struct Coefficients {
        pos: f32,
        nextPos: f32,
        side: f32,
        right: f32,
        down: f32,
      }

      const SQRT3_4 = sqrt(3) / 4;

      const coefficientsList = array<Coefficients, 6 * 3>(
        Coefficients(1, 0, 0, -0.5, 0),
        Coefficients(1, 0, 0, -0.25, SQRT3_4),
        Coefficients(1, 0, 0, -0.25, -SQRT3_4),

        Coefficients(1, 0, 0, -0.25, -SQRT3_4),
        Coefficients(1, 0, 0, -0.25, SQRT3_4),
        Coefficients(1, 0, 0, 0.25, SQRT3_4),

        Coefficients(1, 0, 0, -0.25, -SQRT3_4),
        Coefficients(1, 0, 0, 0.25, SQRT3_4),
        Coefficients(1, 0, 0, 0.25, -SQRT3_4),

        Coefficients(1, 0, 0, 0.25, -SQRT3_4),
        Coefficients(1, 0, 0, 0.25, SQRT3_4),
        Coefficients(1, 0, 0, 0.5, 0),

        Coefficients(1, 0, -0.5, 0, 0),
        Coefficients(0, 1, -0.5, 0, 0),
        Coefficients(1, 0, 0.5, 0, 0),

        Coefficients(1, 0, 0.5, 0, 0),
        Coefficients(0, 1, 0.5, 0, 0),
        Coefficients(0, 1, -0.5, 0, 0),
      );

      @vertex fn vertex(
        @builtin(vertex_index) index: u32,
        @location(0) pos: vec2f,
        @location(1) nextPos: vec2f,
      ) -> @builtin(position) vec4f {
        var coefficients = coefficientsList[index];
        var side = uniforms.size * normalize(turn(nextPos - pos));
        var vertex =
          coefficients.pos * pos +
          coefficients.nextPos * nextPos +
          coefficients.side * side +
          vec2f(coefficients.right, coefficients.down) * uniforms.size;
        vertex = ((vertex / vec2f(uniforms.width, uniforms.height)) - vec2f(0.5, 0.5)) * 2;
        return select(
          vec4f(0),
          vec4f(vertex, 0, 1),
          pos.x != ${gapNumber} && (nextPos.x != ${gapNumber} || index <= 4 * 3),
        );
      }

      fn turn(v: vec2f) -> vec2f {
        return vec2f(-v.y, v.x);
      }

      @fragment fn fragment() -> @location(0) vec4f {
        return vec4f(1, 0, 0, 1);
      }
    `,
  });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vertex',
      buffers: [{
        arrayStride: 2 * 4,
        stepMode: 'instance',
        attributes: [{
          shaderLocation: 0,
          offset: 0,
          format: 'float32x2',
        }],
      }, {
        arrayStride: 2 * 4,
        stepMode: 'instance',
        attributes: [{
          shaderLocation: 1,
          offset: 0,
          format: 'float32x2',
        }],
      }],
    },
    fragment: {
      module,
      entryPoint: 'fragment',
      targets: [{
        format: navigator.gpu.getPreferredCanvasFormat(),
      }],
    },
  });

  const uniformBuffer = device.createBuffer({
    size: 8 * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    mappedAtCreation: true,
  });
  new Float32Array(uniformBuffer.getMappedRange()).set([
    width,
    height,
    size,
  ]);
  uniformBuffer.unmap();
  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: {
        buffer: uniformBuffer,
      },
    }],
  });

  const pointsBuffer = device.createBuffer({
    size: (length + 1) * 2 * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(pointsBuffer.getMappedRange()).set(points);
  pointsBuffer.unmap();


  const commandEncoder = device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  renderPass.setPipeline(pipeline);
  renderPass.setBindGroup(0, uniformBindGroup);
  renderPass.setVertexBuffer(0, pointsBuffer);
  renderPass.setVertexBuffer(1, pointsBuffer, 2 * 4);
  renderPass.draw(6 * 3, length);
  renderPass.end();
  device.queue.submit([commandEncoder.finish()]);
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

main();