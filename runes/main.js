async function main() {
  // Data
  const scale = 4;
  const width = Math.ceil(window.innerWidth / 4);
  const height = Math.ceil(window.innerHeight / 4);
  const length = 10;
  const size = 4;
  const points = new Float32Array(length * 2);

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
      }

      @group(0) @binding(0) var<uniform> uniforms: Uniforms;

      @vertex fn vertex(
        @builtin(vertex_index) index: u32,
        @location(0) pos: vec2f,
        @location(1) nextPos: vec2f,
      ) -> @builtin(position) vec4f {
        var vertices = array<vec2f, 3>(
          pos,
          nextPos,
          pos + uniforms.size * normalize(turn(nextPos - pos)),
        );
        var vertex = vertices[index];
        vertex = ((vertex / vec2f(uniforms.width, uniforms.height)) - vec2f(0.5, 0.5)) * 2;
        return vec4(vertex, 0, 1);
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
    size: length * 2 * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
  });


  let frame = 0;
  while (true) {
    for (let i = 0; i < length; ++i) {
      points[i * 2 + 0] = width / 2 + deviate(width / 8);
      points[i * 2 + 1] = height / 2 + deviate(height / 8);
    }
    device.queue.writeBuffer(pointsBuffer, 0, points);
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
    renderPass.draw(3, length - 1);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);

    await sleep((1 - Math.cos(frame / 10)) * 1000);
    ++frame;
  }
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function sleep(n) {
  return new Promise(resolve => setTimeout(resolve, n));
}

main();