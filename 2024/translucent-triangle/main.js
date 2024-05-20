async function main() {
  document.body.style.cssText = `
    background-color: black;
    margin: 0;
    padding: 0;
    overflow: hidden;
  `;

  const canvas = document.createElement('canvas');
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);

  // Set up WebGL2.
  const gl = canvas.getContext('webgl2', { antialias: false });
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthFunc(gl.LESS);
  gl.clearColor(0, 0, 0, 0);
  gl.clearDepth(1);

  // Set up framebuffer.
  const pixelation = 8;
  const framebufferA = createFramebuffer(gl, /*useTexture=*/false, width, height);
  const framebufferB = createFramebuffer(gl, /*useTexture=*/true, width / pixelation, height / pixelation);

  let count = 0;
  while (true) {
    const time = await new Promise(requestAnimationFrame);

    // Render a triangle onto the first framebuffer.
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebufferA);
    gl.viewport(0, 0, width, height);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    renderTriangle(gl, -0.2, -0.2, 1.5, time * -0.0008, 1, 0, 0);

    // Copy the first framebuffer's depth buffer into the second framebuffer's depth buffer.
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebufferA);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebufferB);
    gl.blitFramebuffer(0, 0, width, height, 0, 0, width / pixelation, height / pixelation, gl.DEPTH_BUFFER_BIT, gl.NEAREST);

    // Render a triangle in the second framebuffer.
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebufferB);
    gl.viewport(0, 0, width / pixelation, height / pixelation);
    gl.clear(gl.COLOR_BUFFER_BIT);
    renderTriangle(gl, 0.2, -0.2, 1.5, time * 0.0011, 0.5, 0, 0);

    // Render the second framebuffer onto the first framebuffer with opacity.
    gl.disable(gl.DEPTH_TEST);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebufferA);
    gl.viewport(0, 0, width, height);
    renderTexture(gl, framebufferB.colourTexture, 0.5);

    // Render the first framebuffer onto the canvas.
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebufferA);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
  }
}

function createFramebuffer(gl, useTexture, width, height) {
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);

  const depthRenderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);
  gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer);
  framebuffer.depthRenderbuffer = depthRenderbuffer;

  if (useTexture) {
    const colourTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, colourTexture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, width, height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colourTexture, 0);
    framebuffer.colourTexture = colourTexture;
  } else {
    const colourRenderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, colourRenderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, width, height);
    gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colourRenderbuffer);
    framebuffer.colourRenderbuffer = colourRenderbuffer;
  }

  return framebuffer;
}

function renderTriangle(gl, x, y, z, turn, r, g, b) {
  if (!gl.triangleProgram) {
    gl.triangleProgram = createProgram(
      gl,
      `#version 300 es
        precision mediump float;

        uniform vec3 position;
        uniform float turn;

        void main() {
          float angle = float(gl_VertexID) / 3.0 * 6.28;
          vec3 vertexPosition = vec3(sin(angle), cos(angle), 0.0);
          vec3 rotatedVertexPosition = vec3(
            vertexPosition.x * cos(turn) - vertexPosition.z * sin(turn),
            vertexPosition.y,
            vertexPosition.x * sin(turn) + vertexPosition.z * cos(turn));

          gl_Position.xyz = position + rotatedVertexPosition;
          gl_Position.w = gl_Position.z + 1.0;
        }
      `,
      `#version 300 es
        precision mediump float;

        uniform vec3 colour;
        out vec4 fragmentColour;

        void main() {
          fragmentColour = vec4(colour, 1.0);
        }
      `,
    );
  }

  gl.useProgram(gl.triangleProgram);
  gl.uniform3f(gl.getUniformLocation(gl.triangleProgram, 'position'), x, y, z);
  gl.uniform1f(gl.getUniformLocation(gl.triangleProgram, 'turn'), turn);
  gl.uniform3f(gl.getUniformLocation(gl.triangleProgram, 'colour'), r, g, b);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function renderTexture(gl, texture, opacity) {
  if (!gl.textureProgram) {
    gl.textureProgram = createProgram(
      gl,
      `#version 300 es
        precision mediump float;

        const vec4 vertices[4] = vec4[4](
          vec4(-1, -1, 0, 1),
          vec4(-1, 1, 0, 1),
          vec4(1, -1, 0, 1),
          vec4(1, 1, 0, 1)
        );

        out vec2 uv;

        void main() {
          gl_Position = vertices[gl_VertexID];
          uv = (gl_Position.xy + vec2(1.0, 1.0)) / 2.0;
        }
      `,
      `#version 300 es
        precision mediump float;

        uniform sampler2D sampler;
        uniform float opacity;

        in vec2 uv;
        out vec4 fragmentColour;

        void main() {
          fragmentColour = texture(sampler, uv);
          fragmentColour.a *= opacity;
        }
      `,
    );
  }

  gl.useProgram(gl.textureProgram);
  gl.bindSampler(0, gl.textureProgram.sampler);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(gl.getUniformLocation(gl.textureProgram, 'sampler'), 0);
  gl.uniform1f(gl.getUniformLocation(gl.textureProgram, 'opacity'), opacity);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  logIf(gl.getShaderInfoLog(vertexShader));

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);
  logIf(gl.getShaderInfoLog(fragmentShader));

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  logIf(gl.getProgramInfoLog(program));

  return program;
}

function logIf(text) {
  if (text) {
    console.log(text);
  }
}

main();