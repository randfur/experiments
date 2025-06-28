import {Matrix} from './matrix.js';

const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;

function logIf(text) {
  if (text !== '') {
    console.log(text);
  }
}

function random(x) {
  return Math.random() * x;
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function lerp(a, b, progress) {
  return a + (b - a) * progress;
}

function pickRandom(list) {
  return list[Math.floor(random(list.length))];
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

const velocityFunctionLists = range(1).map(() => range(10).map(i => {
  const mathFunctions = [
    Math.sin,
    Math.sin,
    Math.cos,
    Math.cos,
    Math.tanh,
    // x => 1 / (1 + (x / 10) ** 2),
  ];
  return range(2).map(() => {
    const mathFunction = pickRandom(mathFunctions);
    const shift = deviate(i / 10);
    const innerCoefficient = 1 + deviate(0.6);
    const outerCoefficient = random(2) < 1 ? -1 : 1;
    return x => outerCoefficient * mathFunction((x - shift) * innerCoefficient);
  });
}));

function getVelocity(x, dimension, progress) {
  let dx = 0;
  for (const velocityFunctionList of velocityFunctionLists) {
    const floatIndex = (velocityFunctionList.length - 1) * progress;
    const index = Math.min(velocityFunctionList.length - 2, Math.floor(floatIndex));
    const subProgress = floatIndex - Math.trunc(floatIndex);
    dx += lerp(velocityFunctionList[index][dimension](x), velocityFunctionList[index + 1][dimension](x), subProgress);
  }
  return dx;
}

const gl = canvas.getContext('webgl2');
const program = gl.createProgram();
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `#version 300 es
precision mediump float;

uniform float time;
uniform mat4 modelTransform;
uniform mat4 cameraTransform;

in vec2 modelPos;
in float modelTimeOffset;

in vec2 vertPos;
in vec3 vertCol;

out vec3 fragCol;

vec4 flapWing() {
  float wingTime = time + modelTimeOffset;
  float wingAngle = sign(vertPos.x) * sin(wingTime / 200.0 + vertPos.y / 3.0) * 6.28 / 4.1;
  return vec4(
    cos(wingAngle) * vertPos.x,
    vertPos.y,
    sin(wingAngle) * vertPos.x,
    1
  );
}

void main() {
  fragCol = vertCol;
  gl_Position = (flapWing() * modelTransform + vec4(modelPos, 0, 0)) * cameraTransform;
  // gl_PointSize = 2.0;
}
`);
gl.compileShader(vertexShader);
logIf(gl.getShaderInfoLog(vertexShader));
gl.attachShader(program, vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `#version 300 es
precision mediump float;

in vec3 fragCol;
out vec4 colOut;

void main() {
  colOut = vec4(fragCol, 1);
}
`);
gl.compileShader(fragmentShader);
logIf(gl.getShaderInfoLog(fragmentShader));
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);
logIf(gl.getProgramInfoLog(program, gl.LINK_STATUS));
gl.useProgram(program);

const vertBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, 1.25,      1, 0, 0,
  -0.825, 0.125, 1, 0.5, 0,
  0, 0,          1, 1, 0.05,

  1, 1.25,       1, 0, 0,
  0.825, 0.125,  1, 0.5, 0,
  0, 0,          1, 1, 0.05,
  
  0, 0,          1, 1, 0.05,
  -0.75, -0.25,  1, 0.5, 0,
  -0.5, -0.75,   1, 0, 0,
  
  0, 0,          1, 1, 0.05,
  0.75, -0.25,   1, 0.5, 0,
  0.5, -0.75,    1, 0, 0,
]), gl.STATIC_DRAW);

const stride = 5 * 4;

const vertPos = gl.getAttribLocation(program, 'vertPos');
gl.enableVertexAttribArray(vertPos);
gl.vertexAttribPointer(vertPos, 2, gl.FLOAT, gl.FALSE, stride, 0);

const vertCol = gl.getAttribLocation(program, 'vertCol');
gl.enableVertexAttribArray(vertCol);
gl.vertexAttribPointer(vertCol, 3, gl.FLOAT, gl.FALSE, stride, 2 * 4);

const models = 8000;
const modelFloats = 3;
const modelBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
const modelData = new Float32Array(models * modelFloats);
for (let i = 0; i < models; ++i) {
  const angle = random(TAU);
  const radius = 2 * (1 - random(1) ** 2);
  modelData[modelFloats * i + 0] = Math.cos(angle) * radius;
  modelData[modelFloats * i + 1] = Math.sin(angle) * radius;
  modelData[modelFloats * i + 2] = 0;
}
gl.bufferData(gl.ARRAY_BUFFER, modelData, gl.DYNAMIC_DRAW);

const modelPos = gl.getAttribLocation(program, 'modelPos');
gl.enableVertexAttribArray(modelPos);
gl.vertexAttribPointer(modelPos, 2, gl.FLOAT, gl.FALSE, modelFloats * 4, 0);
gl.vertexAttribDivisor(modelPos, 1);

const modelTimeOffset = gl.getAttribLocation(program, 'modelTimeOffset');
gl.enableVertexAttribArray(modelTimeOffset);
gl.vertexAttribPointer(modelTimeOffset, 1, gl.FLOAT, gl.FALSE, modelFloats * 4, 2 * 4);
gl.vertexAttribDivisor(modelTimeOffset, 1);

const timeLocation = gl.getUniformLocation(program, 'time');

const cameraTransform = Matrix.create();
const cameraTransformLocation = gl.getUniformLocation(program, 'cameraTransform');

const modelTransform = Matrix.create();
const modelTransformLocation = gl.getUniformLocation(program, 'modelTransform');

let pointerIsDown = false;
let xRotation = -0.5;
let yRotation = 0.5;
function updateRotation(x, y) {
  yRotation = -(x - width / 2) / (width / 2) * TAU / 3;
  xRotation = -(y - height / 2) / (height / 2) * TAU / 3;
}
window.addEventListener('pointermove', ({clientX: x, clientY: y}) => {
  if (pointerIsDown) {
    updateRotation(x, y);
  }
});
window.addEventListener('touchmove', ({targetTouches: [{clientX: x, clientY: y}]}) => {
  if (pointerIsDown) {
    updateRotation(x, y);
  }
});
window.addEventListener('pointerdown', ({clientX: x, clientY: y}) => {
  pointerIsDown = true;
  updateRotation(x, y);
});
window.addEventListener('pointerup', () => {
  pointerIsDown = false;
});

gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE);
gl.clearColor(0, 0, 0, 0);

function renderFrame(time) {
  gl.uniform1f(timeLocation, time);

  Matrix.reset(cameraTransform);
  cameraTransform[4 * 3 + 2] = 0.0;
  if (width < height) {
    Matrix.scale(cameraTransform, 1, width / height);
  } else {
    Matrix.scale(cameraTransform, height / width, 1);
  }
  Matrix.scale(cameraTransform, 1 / Math.min(10, time / 4000));
  gl.uniformMatrix4fv(cameraTransformLocation, gl.FALSE, cameraTransform);

  Matrix.reset(modelTransform);
  const scale = 1 / 4;
  Matrix.scale(modelTransform, scale, scale, scale);
  Matrix.rotateY(modelTransform, yRotation);
  Matrix.rotateX(modelTransform, xRotation);
  gl.uniformMatrix4fv(modelTransformLocation, gl.FALSE, modelTransform);

  modelData[modelFloats * Math.floor(random(models))] += deviate(0.001);
  const interpolationProgress = (Math.sin(time / 10000) + 1) / 2;
  for (let i = 0; i < models; ++i) {
    const x = modelData[modelFloats * i + 0];
    const y = modelData[modelFloats * i + 1];
    let dx = getVelocity(y, 0, interpolationProgress);
    let dy = getVelocity(x, 1, interpolationProgress);
    
    const originDistance = Math.sqrt(x ** 2 + y ** 2);
    const originPull = 1 / 1000;
    if (originDistance > 10) {
      dx -= x * originPull * originDistance;
      dy -= y * originPull * originDistance;
    }

    const dampening = 30;
    modelData[modelFloats * i + 0] += dx / dampening;
    modelData[modelFloats * i + 1] += dy / dampening;
    modelData[modelFloats * i + 2] += 10 * (dx ** 2 + dy ** 2);
  }
  gl.bufferData(gl.ARRAY_BUFFER, modelData, gl.STATIC_DRAW);
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 12, models);
  requestAnimationFrame(renderFrame);
}
renderFrame(0);
  
console.log('All good.');
globalThis.gl = gl;
