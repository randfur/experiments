function logIf(text) {
  if (text) {
    console.log(text);
  }
}

function initShaderProgram(gl, vsSource, fsSource) {
  const program = gl.createProgram();

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);
  logIf(gl.getShaderInfoLog(vertexShader));
  gl.attachShader(program, vertexShader);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);
  logIf(gl.getShaderInfoLog(fragmentShader));
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  logIf(gl.getProgramInfoLog(program));

  return program;
}

export class Shader {
  static async main() {
    // AI generated: https://chatgpt.com/c/2f6e5134-c086-49df-9e2d-73a8f4220501

    // Vertex shader
    var vsSource = `#version 300 es
      precision mediump float;

      in vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    // Fragment shader
    var fsSource = `#version 300 es
      precision mediump float;

      out vec4 outColour;

      void main() {
        vec4 colour = vec4(1.0, 1.0, 1.0, 0.5); // semi-transparent white
        colour.rgb *= colour.a; // premultiply alpha
        outColour = colour;
        // outColour = vec4(0.5, 0.5, 0.5, 0.5);
      }
    `;

    // Initialize WebGL and shaders
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    var gl = canvas.getContext('webgl2');
    var program = initShaderProgram(gl, vsSource, fsSource);
    gl.useProgram(program);

    // Define a simple rectangle
    var vertices = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0
    ]);

    // Buffer setup
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Attribute setup
    var vertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPosition);
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

    // Blending setup
    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Clear color and draw
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
