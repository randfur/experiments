'use strict';

const width = window.innerWidth;
const height = window.innerHeight;
const context = canvas.getContext('2d');

const TAU = 2 * Math.PI;
const radius = Math.min(width, height) / 2 * 0.8;
const points = 2 ** 10;
const colours = [
  '231, 10, 10',
  '255, 140, 5',
  '255, 269, 20',
  '20, 129, 10',
  '10, 68, 255',
  '118, 10, 137',
].map(rgb => `rgb(${rgb}, 0.25)`);
let coefficient = 1;
let speed = 1;
let targetSpeed = 0.1;

function getColour(fraction) {
  return colours[Math.abs((fraction * (coefficient - 1)) | 0) % colours.length];
}

function getX(fraction) {
  return width / 2 + radius * Math.sin(TAU * fraction);
}

function getY(fraction) {
  return height / 2 - radius * Math.cos(TAU * fraction);
}

function init() {
  canvas.width = width;
  canvas.height = height;
  context.globalCompositeOperation = 'screen';
  context.lineWidth = 2;
}

function pointermoveEvent({offsetX}) {
  targetSpeed = (offsetX - width / 2) / width;
}

function mousedownEvent() {
  coefficient = 1;
  speed = 2;
}

function update(time, timeDelta) {
  speed += (targetSpeed - speed) / 20;
  coefficient += timeDelta * speed;
}

function draw() {
  context.clearRect(0, 0, width, height);
  for (let i = 1; i < points; ++i) {
    const fraction = i / points;
    context.strokeStyle = getColour(fraction);
    context.beginPath();
    context.moveTo(getX(fraction), getY(fraction));
    context.lineTo(getX(coefficient * fraction), getY(coefficient * fraction));
    context.stroke();
  }
}

function eachFrame(f) {
  let previousTime = null;
  function frame(time) {
    const timeDelta = previousTime == null ? 0 : time - previousTime;
    f(time / 1000, timeDelta / 1000);
    previousTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function main() {
  init();
  window.addEventListener('pointermove', pointermoveEvent);
  window.addEventListener('mousedown', mousedownEvent);
  eachFrame((time, timeDelta) => {
    update(time, timeDelta);
    draw();
  });
}
main();
