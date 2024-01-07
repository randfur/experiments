export class Render {
  static canvas;
  static device;
  static context;
  static pipeline;
  static uniformBuffer;
  static uniformBindGroup;

  static async init() {
    this.canvas = document.createElement('canvas');
    this.device = await (await navigator.gpu.requestAdapter()).requestDevice();

    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    document.body.append(this.canvas);
    this.context = this.canvas.getContext('webgpu');
    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
    });

    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: this.device.createShaderModule({
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
        module: this.device.createShaderModule({
          code: `
          const xScale = ${Math.max(1, innerWidth / innerHeight)};
          const yScale = ${Math.max(1, innerHeight / innerWidth)};
          struct Uniforms {
            a: vec4f,
            b: vec4f,
            c: vec4f,
          };
          @group(0) @binding(0) var<uniform> uniforms: Uniforms;
          const zoom = 1.0;

          @fragment
          fn main(@builtin(position) position: vec4f, @location(0) vertex: vec2f) -> @location(0) vec4f {
            let xDir = normalize(uniforms.a);
            let yDir = normalize(uniforms.b - xDir * dot(xDir, uniforms.b));
            let pixelPosition = uniforms.c + (xDir * vertex.x * xScale + yDir * vertex.y * yScale) * zoom;

            var z = pixelPosition.xy;
            var c = pixelPosition.zw;
            const maxCount: u32 = 100;
            const countDivisor = 50;
            var count: u32 = 0;
            for (var i: u32 = 0; i < maxCount; i += 1) {
              z = vec2f(z.x * z.x - z.y * z.y, 2 * z.x * z.y) + c;
              count = select(count, i, length(z) < 2);
            }

            return vec4f(vec3(1, 0, 0) * min(1, f32(count) / f32(countDivisor)), 1);
          }
          `,
        }),
        entryPoint: 'main',
        targets: [{
          format: navigator.gpu.getPreferredCanvasFormat(),
        }],
      },
    });

    this.uniformBuffer = this.device.createBuffer({
      size: 3 * 4 * 32 / 8,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.uniformBindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: {
          buffer: this.uniformBuffer,
        },
      }],
    });
  }

  static render(uniformData) {
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

    const commandEncoder = this.device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.draw(6);
    renderPass.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }
}