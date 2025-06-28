'use strict';

let width = null;
let height = null;
let context = null;
let matrixA = null;
let matrixB = null;
let frameLoopA = null;
let frameLoopB = null;

function main() {
  init();
  requestAnimationFrame(frame);
}

function init() {
  width = innerWidth;
  height = innerHeight;
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  context.globalCompositeOperation = 'screen';
  frameLoopA = frameLoopGenerator();
  frameLoopB = frameLoopGenerator();
  frameLoopA.next(0);
  frameLoopB.next(0);
}

function* frameLoopGenerator() {
  let froms = [createMatrix(), createMatrix()];
  let from = createMatrix();
  let tos = [createMatrix(), createMatrix()];
  let to = createMatrix();
  let matrix = createMatrix();
  while (true) {
    let time = yield matrix;
    const fraction = (Math.sin(time / 2000) + 1) / 2;
    if (fraction > 0.9999)
        froms = [createMatrix(), createMatrix()];
    else if (fraction < -0.001)
      tos = [createMatrix(), createMatrix()];

    interpolate(froms[0], froms[1], Math.sin(time / 3000), from);
    interpolate(tos[0], tos[1], Math.sin(time / 4000), to);
    interpolate(from, to, fraction, matrix);
  }
}

function interpolate(a, b, t, out) {
  for (let i = 0; i<out.length; ++i) {
    for (let j = 0; j<out[i].length; ++j) {
      out[i][j] = a[i][j] + (b[i][j] - a[i][j]) * t;
    }
  }
}

function frame(time) {
  matrixA = frameLoopA.next(time).value;
  matrixB = frameLoopB.next(time).value;
  render();
  requestAnimationFrame(frame);
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i)
    result.push(i);
  return result;
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function createMatrix() {
  return range(2).map(_ => range(2).map(_ => deviate(2)));
}

function render() {
  const interval = 32;
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.lineWidth = 3;
  for (let x = -width / 2; x <= width / 2; x += interval) {
    for (let y = -height / 2; y <= height / 2; y += interval) {
      const phase = 0;
      // const phase = performance.now() / 200;
      // const fraction = 4 * (x**2 + y**2) / (width ** 2 + height ** 2);
      const fraction = 1 / 2 + (x + y) / (width + height);
      context.strokeStyle = `hsla(${phase + fraction * 45}deg, 100%, 50%, 0.25)`;
      context.beginPath();
      context.moveTo(
        // x, y
        matrixA[0][0] * x + matrixA[0][1] * y,
        matrixA[1][0] * x + matrixA[1][1] * y,
      );
      context.lineTo(
        matrixB[0][0] * x + matrixB[0][1] * y,
        matrixB[1][0] * x + matrixB[1][1] * y,
      );
      context.stroke();
    }
  }
  context.restore();
}

window.onresize = init;

main();
