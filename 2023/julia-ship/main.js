const width = window.innerWidth;
const height = window.innerHeight;
const canvas = document.createElement('canvas');

async function main() {
  const device = await (await navigator.gpu.requestAdapter()).requestDevice();

  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);
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
        const vertices = array(
          vec2f(-1, -1),
          vec2f(-1, 1),
          vec2f(1, -1),
          vec2f(1, -1),
          vec2f(-1, 1),
          vec2f(1, 1),
        );

        struct Output {
          @location(0) vertex: vec2f,
          @builtin(position) position: vec4f,
        }

        @vertex
        fn main(@builtin(vertex_index) vertex_index: u32) -> Output {
          var output: Output;
          output.vertex = vertices[vertex_index];
          output.position = vec4f(output.vertex, 0, 1);
          return output;
        }
        `,
      }),
      entryPoint: 'main',
    },
    fragment: {
      module: device.createShaderModule({
        code: `
        const a = vec4f(3, 4, -2, 9);
        const b = vec4f(-1, 0, 1, 4);
        // const a = vec4f(1, 0, 0, 0);
        // const b = vec4f(0, 1, 0, 0);
        // const a = vec4f(1, 0, 0, 0);
        // const b = vec4f(0, 0, 0, 1);
        const c = vec4f(0.1, -0.7, 0.4, 0.2);

        @fragment
        fn main(@builtin(position) position: vec4f, @location(0) vertex: vec2f) -> @location(0) vec4f {
          let xDir = normalize(a);
          let yDir = normalize(b - xDir * dot(xDir, b));
          // let centralPosition = vec4f(0, 0, -1.17, 0.187);
          let pixelPosition = c + xDir * vertex.x + yDir * vertex.y;

          var z = pixelPosition.xy;
          var c = pixelPosition.zw;
          const maxCount: u32 = 100;
          var count: u32 = 0;
          for (var i: u32 = 0; i < maxCount; i += 1) {
            z = vec2f(z.x * z.x - z.y * z.y, 2 * z.x * z.y) + c;
            count = select(count, i, length(z) < 2);
          }

          return vec4f(vec3(1, 1, 1) * f32(count) / f32(maxCount), 1);
        }
        `,
      }),
      entryPoint: 'main',
      targets: [{
        format: navigator.gpu.getPreferredCanvasFormat(),
      }],
    },
  });

  // const uniformBuffer = device.createBuffer({
  // });

  const commandEncoder = device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  renderPass.setPipeline(pipeline);
  renderPass.draw(6);
  renderPass.end();
  device.queue.submit([commandEncoder.finish()]);
}

main();