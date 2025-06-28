'use strict';

const width = window.innerWidth;
const height = window.innerHeight;
const context = canvas.getContext('2d');
let tally = null;
let peak = 0.5;
let slopes = {
  1: _ => 1 - Math.abs(Math.random() + Math.random() - 1),
  2: _ => Math.random()**0.125,
  3: _ => 1 - Math.random() * Math.random(),
  4: _ => 1 - Math.random()**2,
};
let slope = Object.values(slopes)[0];

function random(p) {
  if (Math.random() < p)
    return slope() * p;
  return p + (1 - slope()) * (1 - p);
}
  
function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i)
    result.push(i);
  return result;
}

function resetTally() {
  tally = Array(width).fill(0);
}

function init() {
  canvas.width = width;
  canvas.height = height;
  resetTally();
  output.textContent = '' +
    'Click to set peak value.\n' +
    'Type choice for slope shape:\n' +
    Object.entries(slopes).map(([key, f]) => `  ${key}: ${f}`).join('\n');
}

function clickEvent({clientX}) {
  peak = clientX / width;
  resetTally();
}

function keydownEvent({key}) {
  const f = slopes[key];
  if (f) {
    slope = f;
    resetTally();
  }
}

function update(timeDelta) {
  for (let i = 0; i < 1000; ++i)
    ++tally[(random(peak) * width) | 0]
}

function draw() {
  context.clearRect(0, 0, width, height);
  context.fillStyle = 'blue';
  const max = Math.max(...tally);
  for (let x = 0; x < width; ++x) {
    const barHeight = tally[x] / max * height;
    context.fillRect(x, height - barHeight, 1, barHeight);
  }
}

function eachFrame(f) {
  let previousTime = null;
  function frame(time) {
    const timeDelta = previousTime == null ? 0 : time - previousTime;
    f(timeDelta / 1000);
    previousTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function main() {
  init();
  window.onclick = clickEvent;
  window.onkeydown = keydownEvent;
  eachFrame(timeDelta => {
    update(timeDelta);
    draw();
  });
}
main();
