'use strict';

const rampUpDuration = 5000;
const screenClearCheckWaitDuration = 500;
const runDuration = 10000;
const pushAwayRampUpDefaultDuration = 30000;
const pushAwayRampUpFastDuration = 2000;
const pushAwayMaxDuration = 60000;
const pushAwayFactor = 100;
const breatheDuration = 100;

let width = null;
let height = null;
let context = null;

let colours = null;

const pointCount = 1000;
const pointSize = 100;
let points = [];

let mouseX = null;
let mouseY = null;

let debug = false;

function init() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');

  colours = {
    lightOnDark: false,
    back: randomColour(),
    front: 'black',
  };
  
  for (let i = 0; i < pointCount; ++i) {
    points.push({x: null, y: null});
  }
  
  mouseX = 0;
  mouseY = 0;
  window.addEventListener('pointermove', event => {
    mouseX = event.clientX - width / 2;
    mouseY = event.clientY - height / 2;
  });

  window.addEventListener('keydown', event => {
    if (event.key == 'd') {
      debug ^= true;
      if (!debug) {
        output.textContent = '';
      }
    }
  });
}

function random(x) {
  return Math.random() * x;
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function randomColour() {
  return `hsl(${random(360) | 0}deg, 100%, 50%)`;
}

function swapColours() {
  colours.lightOnDark ^= true;
  colours.front = colours.back;
  colours.back = colours.lightOnDark ? 'black' : randomColour();
}

function resetPoints() {
  for (const point of points) {
    point.x = deviate(width / 2);
    point.y = deviate(height / 2);
  }
}

function update(forceProgress, pushAwayProgress) {
  if (debug) {
    output.textContent = `${forceProgress.toFixed(2)}, ${pushAwayProgress.toFixed(2)}`;
  }
  for (const point of points) {
    point.x += deviate(20 * forceProgress);
    point.y += deviate(20 * forceProgress);
    if (pushAwayProgress > 0) {
      const deltaX = point.x - mouseX;
      const deltaY = point.y - mouseY;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      point.x += pushAwayProgress * pushAwayFactor * (distance > 0 ? deltaX / distance : 1);
      point.y += pushAwayProgress * pushAwayFactor * (distance > 0 ? deltaY / distance : 0);
    }
  }
}

let lastScreenClearCheck = null;
function screenIsClear() {
  if (lastScreenClearCheck !== null && performance.now() - lastScreenClearCheck < screenClearCheckWaitDuration) {
    return false;
  }
  lastScreenClearCheck = performance.now();
  for (const point of points) {
    if ((Math.abs(point.x) < width / 2) && (Math.abs(point.y) < height / 2)) {
      return false;
    }
  }
  return true;
}

function render() {
  context.fillStyle = colours.back;
  context.fillRect(0, 0, width, height);
  context.fillStyle = colours.front;
  for (const point of points) {
    context.fillRect(width / 2 + point.x - pointSize / 2, height / 2 + point.y - pointSize / 2, pointSize, pointSize);
  }
}

function smooth(progress) {
  return progress < 0.5 ? (2 * progress ** 2) : (1 - 2 * (1 - progress) ** 2);
}

function timeProgress(start, duration) {
  if (start === null) {
    return 0;
  }
  return Math.min(performance.now() - start, duration) / duration;
} 

async function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

function listen(eventName, eventHandler) {
  window.addEventListener(eventName, eventHandler);
  return {
    remove() {
      window.removeEventListener(eventName, eventHandler);
    },
  };
}

async function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

async function run() {
  const start = performance.now();
  let pushAwayStart = null;
  let pushAwayRampUpDuration = pushAwayRampUpDefaultDuration;

  let earlyExit = false;
  const eventHandle = listen('pointerdown', event => {
    earlyExit = true;
    if (pushAwayStart === null) {
      pushAwayStart = performance.now();
    } else {
      pushAwayStart = performance.now() - (performance.now() - pushAwayStart) * pushAwayRampUpFastDuration / pushAwayRampUpDuration
    }
    pushAwayRampUpDuration = pushAwayRampUpFastDuration;
  });
  
  while (true) {
    update(smooth(timeProgress(start, rampUpDuration)), timeProgress(pushAwayStart, pushAwayRampUpDuration));

    if (screenIsClear()) {
      if (!earlyExit) {
        await sleep(breatheDuration);
      }
      break;
    }

    render();
    await nextFrame();
    
    if (pushAwayStart === null) {
      if (performance.now() - start > runDuration) {
        pushAwayStart = performance.now();
      }
    } else if (performance.now() - pushAwayStart > pushAwayMaxDuration) {
      break;
    }
  }
  
  eventHandle.remove();
  return earlyExit;
}

async function main() {
  init();
  while (true) {
    swapColours();
    resetPoints();
    await run();
  }
}
main();