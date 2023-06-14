async function main() {
  const scale = 4;
  const width = Math.ceil(window.innerWidth / scale);
  const height = Math.ceil(window.innerHeight / scale);

  // Point data
  const length = 20;
  // struct Point {
  //   x: f32,
  //   y: f32,
  //   colourSize: u32, // 0xRRGGBBSS
  // }
  const pointBytes = 4 + 4 + 4;
  const pointColourSizeOffsetBytes = 4 + 4;
  const points = new ArrayBuffer(length * pointBytes);
  function setPoint(index, {x, y, r, g, b, size}) {
    new Float32Array(points, index * pointBytes).set([x, y]);
    new Uint32Array(points, index * pointBytes + pointColourSizeOffsetBytes).set([
      ((r & 0xff) << 24) +
      ((g & 0xff) << 16) +
      ((b & 0xff) << 8) +
      (size & 0xff)
    ]);
  }
  function clearPoint(index) {
    new Uint32Array(points, index * pointBytes + pointColourSizeOffsetBytes).set([0]);
  }
  for (let i = 0; i < length; ++i) {
    setPoint(i, {
      x: random(width),
      y: random(height),
      r: random(256),
      g: random(256),
      b: random(256),
      size: 1 + random(20),
    });
  }
  clearPoint(0);
  clearPoint(Math.floor(length / 2));
  clearPoint(length - 1);
  console.log(new Float32Array(points));
  console.log(new Uint8Array(points));

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
      const width = ${width};
      const height = ${height};

      struct Coefficients {
        position: f32,
        nextPosition: f32,
        side: f32,
        right: f32,
        down: f32,
      }

      const SQRT3_4 = sqrt(3) / 4;

      const coefficientsList = array<Coefficients, 6 * 3>(
        Coefficients(1, 0, 0, -SQRT3_4, 0.25),
        Coefficients(1, 0, 0, 0, 0.5),
        Coefficients(1, 0, 0, SQRT3_4, 0.25),

        Coefficients(1, 0, 0, SQRT3_4, 0.25),
        Coefficients(1, 0, 0, -SQRT3_4, -0.25),
        Coefficients(1, 0, 0, -SQRT3_4, 0.25),

        Coefficients(1, 0, 0, -SQRT3_4, -0.25),
        Coefficients(1, 0, 0, SQRT3_4, 0.25),
        Coefficients(1, 0, 0, SQRT3_4, -0.25),

        Coefficients(1, 0, 0, -SQRT3_4, -0.25),
        Coefficients(1, 0, 0, SQRT3_4, -0.25),
        Coefficients(1, 0, 0, 0, -0.5),

        Coefficients(1, 0, -0.5, 0, 0),
        Coefficients(0, 1, -0.5, 0, 0),
        Coefficients(1, 0, 0.5, 0, 0),

        Coefficients(1, 0, 0.5, 0, 0),
        Coefficients(0, 1, 0.5, 0, 0),
        Coefficients(0, 1, -0.5, 0, 0),
      );

      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) colour: vec3f,
      }

      @vertex fn vertex(
        @builtin(vertex_index) index: u32,
        @location(0) position: vec2f,
        @location(1) colourSize: u32,
        @location(2) nextPosition: vec2f,
        @location(3) nextColourSize: u32,
      ) -> VertexOutput {
        var colour = getColour(colourSize);
        var size = getSize(colourSize);
        var nextColour = getColour(nextColourSize);
        var nextSize = getSize(nextColourSize);

        var coefficients = coefficientsList[index];

        var clipPosition =
          coefficients.position * position +
          coefficients.nextPosition * nextPosition +
          coefficients.side * normalize(turn(nextPosition - position)) * (coefficients.position * size + coefficients.nextPosition * nextSize) +
          vec2f(coefficients.right, coefficients.down) * size;
        clipPosition = ((clipPosition / vec2f(width, height)) - vec2f(0.5, 0.5)) * 2;
        clipPosition *= f32(size > 0 && (nextSize > 0 || index <= 4 * 3));

        return VertexOutput(
          vec4(clipPosition, 0, 1),
          coefficients.position * colour + coefficients.nextPosition * nextColour,
        );
      }

      fn getColour(colourSize: u32) -> vec3f {
        return vec3f(
          f32((colourSize >> 24) & 0xff) / 255,
          f32((colourSize >> 16) & 0xff) / 255,
          f32((colourSize >> 8) & 0xff) / 255,
        );
      }

      fn getSize(colourSize: u32) -> f32 {
        return f32(colourSize & 0xff);
      }

      fn turn(v: vec2f) -> vec2f {
        return vec2f(-v.y, v.x);
      }

      @fragment fn fragment(vertexOutput: VertexOutput) -> @location(0) vec4f {
        return vec4f(vertexOutput.colour, 1);
      }
    `,
  });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vertex',
      buffers: [{
        arrayStride: pointBytes,
        stepMode: 'instance',
        attributes: [{
          shaderLocation: 0,
          offset: 0,
          format: 'float32x2',
        }, {
          shaderLocation: 1,
          offset: pointColourSizeOffsetBytes,
          format: 'uint32',
        }],
      }, {
        arrayStride: pointBytes,
        stepMode: 'instance',
        attributes: [{
          shaderLocation: 2,
          offset: 0,
          format: 'float32x2',
        }, {
          shaderLocation: 3,
          offset: pointColourSizeOffsetBytes,
          format: 'uint32',
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

  const pointsBuffer = device.createBuffer({
    size: length * pointBytes,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Uint8Array(pointsBuffer.getMappedRange()).set(new Uint8Array(points));
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
  renderPass.setVertexBuffer(0, pointsBuffer);
  renderPass.setVertexBuffer(1, pointsBuffer, pointBytes);
  renderPass.draw(6 * 3, length - 1);
  renderPass.end();
  device.queue.submit([commandEncoder.finish()]);
}

function random(x) {
  return Math.random() * x;
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

main();