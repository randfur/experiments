export class Render {
  static canvas;
  static debugCanvas;
  static debugContext;
  static device;
  static context;
  static pipeline;
  static uniformBuffer;
  static uniformBindGroup;

  static async init() {
    document.body.style = `
      background-color: black;
      padding: 0;
      margin: 0;
      overflow: hidden;
      position: absolute;
    `;

    this.device = await (await navigator.gpu.requestAdapter()).requestDevice();

    this.canvas = document.createElement('canvas');
    this.canvas.style = `
      position: absolute;
      left: 0;
      top: 0;
    `;
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    document.body.append(this.canvas);

    this.debugCanvas = document.createElement('canvas');
    this.debugCanvas.style = `
      position: absolute;
      left: 0;
      top: 0;
    `;
    this.debugCanvas.width = innerWidth;
    this.debugCanvas.height = innerHeight;
    document.body.append(this.debugCanvas);
    this.debugContext = this.debugCanvas.getContext('2d');

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
            centre: vec4f,
            xDirGuide: vec4f,
            yDirGuide: vec4f,
            zoom: f32,
          };
          @group(0) @binding(0) var<uniform> uniforms: Uniforms;

          @fragment
          fn main(@builtin(position) position: vec4f, @location(0) vertex: vec2f) -> @location(0) vec4f {
            let xDir = normalize(uniforms.xDirGuide);
            let yDir = normalize(uniforms.yDirGuide - xDir * dot(xDir, uniforms.yDirGuide));
            let pixelPosition = uniforms.centre + (xDir * vertex.x * xScale + yDir * vertex.y * yScale) * uniforms.zoom;

            var z = pixelPosition.xy;
            var c = pixelPosition.zw;
            const maxCount: u32 = 56;
            var count: u32 = 0;
            var escaped = false;
            var escapeLength: f32 = 0;
            for (var i: u32 = 0; i < maxCount; i += 1) {
              z = vec2f(z.x * z.x - z.y * z.y, 2 * z.x * z.y) + c;
              let zLength = length(z);
              escapeLength = select(zLength, escapeLength, escaped);
              escaped = select(zLength >= 2, true, escaped);
              count = select(i, count, escaped);
            }

            var granularCount = f32(count) + (1 - (escapeLength - 2) / 2);
            let countDivisor = f32(maxCount) * (1 - min(1, uniforms.zoom) / 2);
            return vec4f(
              vec3f(1, 0, 0) * select(1.0, min(1, granularCount / countDivisor), escaped),
              1);
          }
          `,
        }),
        entryPoint: 'main',
        targets: [{
          format: navigator.gpu.getPreferredCanvasFormat(),
        }],
      },
    });

    const f32Bytes = 32 / 8;
    const vec4fBytes = 4 * f32Bytes;
    this.uniformBuffer = this.device.createBuffer({
      size:
        /*xDirGuide=*/vec4fBytes +
        /*yDirGuide=*/vec4fBytes +
        /*centre=*/vec4fBytes +
        /*zoom=*/f32Bytes +
        /*padding=*/3 * f32Bytes,
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