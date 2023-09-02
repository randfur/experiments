async function main() {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.append(canvas);

  const gl = canvas.getContext('webgl2');

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, `#version 300 es
    precision mediump float;

    void main() {
      gl_Position = vec4(
        300. * float(gl_VertexID) / 5.,
        300. * float(gl_VertexID * gl_VertexID) / 5.,
        0,
        ${canvas.width});
    }
  `);
  gl.compileShader(vertexShader);
  console.log(gl.getShaderInfoLog(vertexShader));

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `#version 300 es
    precision mediump float;

    out vec4 fragmentOutColour;

    void main() {
      fragmentOutColour = vec4(1, 0, 0, 1);
    }
  `);
  gl.compileShader(fragmentShader);
  console.log(gl.getShaderInfoLog(fragmentShader));

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  console.log(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

main();