class Main {
  static async main() {
    this.adapter = await navigator.gpu.requestAdapter();
    this.device = await this.adapter.requestDevice();
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('webgpu');
    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
      alphaMode: 'premultiplied',
    });
    
    this.vertices = new Float32Array([
      0, 1,
      -1, -1,
      1, -1,
    ]);
    this.vertexBuffer = this.device.createBuffer({
      size: this.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertices);
    
    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      primitive: {
        topology: 'triangle-list',
      },
      vertex: {
        module: this.device.createShaderModule({
          code: `
            @vertex
            fn main(@location(0) pos: vec2f) -> @builtin(position) vec4f {
              return vec4f(pos, 0, 1);
            }
          `,
        }),
        entryPoint: 'main',
        buffers: [{
          attributes: [{
            shaderLocation: 0,
            offset: 0,
            format: 'float32x2',
          }],
          arrayStride: 8,
          stepMode: 'vertex',
        }],
      },
      fragment: {
        module: this.device.createShaderModule({
          code: `
            @fragment
            fn main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
              return vec4f(1, 1, 1, 1);
            }
          `,
        }),
        entryPoint: 'main',
        targets: [{
          format: navigator.gpu.getPreferredCanvasFormat(),
        }],
      },
    });

    
    this.commandEncoder = this.device.createCommandEncoder();
    this.renderPassEncoder = this.commandEncoder.beginRenderPass({
      colorAttachments: [{
        clearValue: [0, 0, 0, 0],
        loadOp: 'clear',
        storeOp: 'store',
        view: this.context.getCurrentTexture().createView(),
      }],
    });
    this.renderPassEncoder.setPipeline(this.pipeline);
    this.renderPassEncoder.setVertexBuffer(0, this.vertexBuffer);
    this.renderPassEncoder.draw(3);
    this.renderPassEncoder.end();
    this.device.queue.submit([this.commandEncoder.finish()]);
  }
}

Main.main();
console.log([Main]);
