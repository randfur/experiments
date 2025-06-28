'use strict';

const width = window.innerWidth;
const height = window.innerHeight;
const nodeSeparation = 20;
const TAU = Math.PI * 2;

let nodes = null;
let context = null;
let clearing = false;

function main() {
  init();
  everyFrame(deltaSeconds => {
    update(deltaSeconds);
    render();
  });
  
  window.addEventListener('keypress', init);
  window.addEventListener('pointerdown', init);
}

function init() {
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  context.lineWidth = 2;
  
  clearing = false;

  const angle = random(TAU);
  const hueDelta = random(360);
  const waveAmplitude = random(40);
  const waveDeviation = random(80);
  const count = (height / nodeSeparation) | 0;
  const max = count + 1;
  nodes = Array(count).fill(0).map((_, i) => ({
    x: -nodeSeparation,
    y: height * i / max + deviate(10),
    dx: 80 + deviate(10),
    dy: Math.cos(angle + TAU * i / max / 2) * waveAmplitude + deviate(random(random(waveDeviation))),
    targetY: height * i / max,
    frictionY: 2 + random(10),
    cx: deviate(10),
    cy: deviate(nodeSeparation),
    colour: `hsla(${(hueDelta - 360 * i / max) | 0}, 100%, 50%, 0.2)`,
    skipClear: i % 10 == 0,
  }));
}

function random(x) {
  return Math.random() * x;
}
                                              
function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function update(deltaSeconds) {
  deltaSeconds = 1/60;
  if (nodes.every(node => node.x > width)) {
    for (const node of nodes) {
      node.x = -node.dx * 2;
    }
    clearing ^= true;
  }
  let lastNode = null;
  for (const node of nodes) {
    node.x += deltaSeconds * node.dx;
    node.y += deltaSeconds * node.dy;
    node.dy += (node.targetY - node.y) / node.frictionY * deltaSeconds;
    if (lastNode) {
      // node.dy -= (lastNode.dy - node.dy) / 100 * deltaSeconds;
    }
    lastNode = node;
  }
}

function render() {
  let lastNode = null;
  for (const node of nodes) {
    if (lastNode) {
      if (!clearing || !node.skipClear) {
        context.beginPath();
        context.strokeStyle = clearing ? 'black' : node.colour;
        context.moveTo(lastNode.x, lastNode.y);
        context.bezierCurveTo(
          lastNode.x + lastNode.cx,
          lastNode.y + lastNode.cy,
          node.x - node.cx,
          node.y - node.cy,
          node.x,
          node.y);
        context.stroke();
      }
    }
    lastNode = node;
  }
}

let lastTimeMilliseconds = performance.now();
function everyFrame(f) {
  function loop(timeMilliseconds) {
    f((timeMilliseconds - lastTimeMilliseconds) / 1000);
    lastTimeMilliseconds = timeMilliseconds;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function print(text) {
  output.textContent += text + '\n';
}

main();