const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;

function logIf(text) {
  if (text !== '') {
    console.log(text);
    output.textContent += text + '\n';
  }
}

window.addEventListener('error', ({error: {stack}}) => {
  output.textContent += stack;
});

const gl = canvas.getContext('webgl2');
globalThis.gl = gl;
const program = gl.createProgram();

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `#version 300 es
precision mediump float;

in vec2 modelPos;
in vec3 pos;
in vec3 lastPos;

void main() {
  gl_Position = vec4(pos + vec3(modelPos, 0), 1);
}
`);
gl.compileShader(vertexShader);
logIf(gl.getShaderInfoLog(vertexShader));

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `#version 300 es
precision mediump float;

out vec4 col;

void main() {
  col = vec4(0.7, 0.1, 0.9, 1.0);
}
`);
gl.compileShader(fragmentShader);
logIf(gl.getShaderInfoLog(fragmentShader));

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
logIf(gl.getProgramInfoLog(program));
gl.useProgram(program);

const vertexArray = gl.createVertexArray();
gl.bindVertexArray(vertexArray);
const modelBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -0.5, 0.5,
  1, 0.5,
  0.5, -0.5,
  
  -0.5, 0.5,
  0.5, -0.5,
  -1, -0.5,
]), gl.STATIC_DRAW);
const modelPosLocation = gl.getAttribLocation(program, 'modelPos');
gl.enableVertexAttribArray(modelPosLocation);
gl.vertexAttribPointer(modelPosLocation, 2, gl.FLOAT, gl.FALSE, 2 * 4, 0);
gl.drawArrays(gl.TRIANGLES, 0, 6);
gl.bindVertexArray(null);




logIf('All good.');
