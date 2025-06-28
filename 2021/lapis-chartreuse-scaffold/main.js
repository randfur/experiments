import {Task} from './task.js';
import {range, random, randomRange, deviate} from './utils.js';
import {width, height, initDrawing, drawScope} from './drawing.js';

async function drawForever(task, drawFunc) {
  task.register(drawScope(drawFunc));
  await task.forever();
}

async function fence(task) {
  const fenceCanvas = new OffscreenCanvas(width, height);
  const fenceContext = fenceCanvas.getContext('2d');

  const litColour = '#798';
  const normalColour = '#687';
  const shadeColour = '#576';

  const spacing = randomRange(50, 70);
  const deepPeriod = 3;
  const deepPhase = Math.floor(random(deepPeriod));
  const initialOffset = random(spacing);

  fenceContext.fillStyle = normalColour;
  fenceContext.fillRect(0, 0, width, height);
  
  fenceContext.rotate(randomRange(0.025, 0.075));
  
  for (const i of range(width / spacing)) {
    const isDeep = (i % deepPeriod) == deepPhase;
    const sideWidth = isDeep ? 15 : 5;
    const middleWidth = isDeep ? 15 : 15;
    const x = initialOffset + i * spacing;
    fenceContext.fillStyle = litColour;
    fenceContext.fillRect(x - sideWidth - middleWidth / 2, -height, sideWidth, height * 2);
    fenceContext.fillStyle = shadeColour;
    fenceContext.fillRect(x + middleWidth / 2, -height, sideWidth, height * 2);
  }
  
  await drawForever(task, context => {
    context.drawImage(fenceCanvas, 0, 0);
  });
}

async function garden(task) {
  const plants = range(100).map(i => ({
    x: random(width),
    y: height + random(40),
    height: randomRange(60, 120),
    controlHeightPercent: random(1),
    curve: deviate(10),
  }));
  await drawForever(task, context => {
    context.strokeStyle = '#351';
    context.beginPath();
    for (const {x, y, height, controlHeightPercent, curve} of plants) {
      context.moveTo(x, y);
      context.quadraticCurveTo(x, y - height * controlHeightPercent, x + curve, y - height);
    }
    context.stroke();
  });
}

async function main() {
  initDrawing();

  Task.spawn(async task => {
    task.spawn(fence);
    task.spawn(garden);
    await task.forever();
  });
}

main();