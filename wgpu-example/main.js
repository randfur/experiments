async function main() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  const context = canvas.getContext('webgpu');
  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: `
          @vertex
          fn main(@builtin(vertex_index) index : u32) -> @builtin(position) vec4f {
            return vec4f(
              f32(index / 2) - 0.5,
              f32(index % 2) - 0.5,
              0,
              1,
            );
          }
        `,
      }),
      entryPoint: 'main',
    },
    fragment: {
      module: device.createShaderModule({
        code: `
          @fragment
          fn main() -> @location(0) vec4f {
            return vec4f(1, 0, 0, 1);
          }
        `,
      }),
      entryPoint: 'main',
      targets: [{
        format: navigator.gpu.getPreferredCanvasFormat(),
      }],
    },
    primitive: {
      topology: 'triangle-strip',
    },
  });

  const commandEncoder = device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  renderPass.setPipeline(pipeline);
  renderPass.draw(4);
  renderPass.end();
  device.queue.submit([commandEncoder.finish()]);
}

main();