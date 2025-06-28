'use strict';

let width = null;
let height = null;
let context = null;
let frameLoop = null;

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
  frameLoop = frameLoopGenerator();
}

function* frameLoopGenerator() {
  let square = createSquare();
  let axis = createVec3(deviate(1), deviate(1), deviate(1));
  axis.normalise();
  let xAxis = createVec3(1, 0, 0);
  while (true) {
    let time = yield matrix;
    axis.rotate(xAxis, time / 500);
    square.rotate(axis, time / 40);
    square.render(context);
  }
}


function frame(time) {
  frameLoop.next(time);
  requestAnimationFrame(frame);
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i)
    result.push(i);
  return result;
}

window.onresize = init;

main();
