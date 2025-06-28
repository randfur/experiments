import {clearDebugPrint, currentTime, debugPrint, randomColour, deviate, onClick, smooth, sleep, timeProgress, timeProgressUpHoldDown, nextFrame} from './utils.js';
import {initGL, createGrid, resetGrid, updateGrid, allPointsOutOfBounds, renderGrid} from './gl-stuff.js';

const rampUpDuration = 10_000;
const holdDuration = 60_000;
const rampDownDuration = 60_000;
const screenClearCheckWaitDuration = 1_000;
const runDuration = 60_000;
const forceMaxFactor = 1 / 4;
const pushAwayRampUpDefaultDuration = 600_000;
const pushAwayRampUpFastDuration = 20_000;
const pushAwayMaxDuration = 60_000;
const pushAwayKickStartInitialProgress = 0.005;
const pushAwayMaxFactor = 1;
const breatheDuration = 1_000;

const pointSize = 1;

let width = null;
let height = null;
let minWidthHeight = null;

let gl = null;
let gridWidth = null;
let gridHeight = null;
let gridSource = null;
let gridDestination = null;

let colours = null;

let mouseX = null;
let mouseY = null;

let debug = false;

function init() {
  gridWidth = Math.ceil(window.innerWidth / pointSize);
  gridHeight = Math.ceil(window.innerHeight / pointSize);
  width = gridWidth * pointSize;
  height = gridHeight * pointSize;
  const minWidthHeight = Math.min(width, height);

  mouseX = 0;
  mouseY = - height / minWidthHeight;
  window.addEventListener('pointermove', event => {
    mouseX = (event.clientX - width / 2) / (minWidthHeight / 2);
    mouseY = -(event.clientY - height / 2) / (minWidthHeight / 2);
  });

  window.addEventListener('keydown', event => {
    if (event.key == 'd') {
      debug ^= true;
      if (!debug) {
        clearDebugPrint();
      }
    }
  });
  
  canvas.width = width;
  canvas.height = height;
  gl = canvas.getContext('webgl2');
  initGL(gl);

  colours = {
    lightOnDark: false,
    back: randomColour(),
    front: [0, 0, 0],
  };
  
  gridSource = createGrid(gl, gridWidth, gridHeight);
  gridDestination = createGrid(gl, gridWidth, gridHeight);
  resetGrid(gl, gridSource);
}

function swapGrids() {
  const temp = gridSource;
  gridSource = gridDestination;
  gridDestination = temp;
}

function swapColours() {
  colours.lightOnDark ^= true;
  colours.front = colours.back;
  colours.back = colours.lightOnDark ? [0, 0, 0] : randomColour();
}

function resetPoints() {
  resetGrid(gl, gridSource);
}

async function run() {
  const start = currentTime();
  let pushAwayStart = null;
  let pushAwayRampUpDuration = pushAwayRampUpDefaultDuration;

  let earlyPushAway = false;
  let earlyExit = false;
  const eventHandle = onClick(event => {
    if (!earlyPushAway) {
      earlyPushAway = true;
      const now = currentTime();
      const currentProgress = pushAwayStart ? ((now - pushAwayStart) / pushAwayRampUpDuration) : pushAwayKickStartInitialProgress;
      pushAwayRampUpDuration = pushAwayRampUpFastDuration;
      pushAwayStart = now - currentProgress * pushAwayRampUpDuration;
    } else {
      earlyExit = true;
    }
  });
  
  while (true) {
    const forceFactor = smooth(timeProgressUpHoldDown(start, rampUpDuration, holdDuration, rampDownDuration)) * forceMaxFactor;
    const pushAwayFactor = smooth(timeProgress(pushAwayStart, pushAwayRampUpDuration)) * pushAwayMaxFactor;
    if (debug) {
      clearDebugPrint();
      debugPrint(`forceFactor: ${forceFactor.toFixed(2)}`);
      debugPrint(`pushAwayFactor: ${pushAwayFactor.toFixed(2)}`);
    }
    updateGrid(gl, gridSource, gridDestination, currentTime() - start, forceFactor, pushAwayFactor, mouseX, mouseY);
    swapGrids();

    if (screenIsClear()) {
      if (!earlyPushAway) {
        await sleep(breatheDuration);
      }
      break;
    }

    renderGrid(gl, gridSource, pointSize, colours, width, height);
    await nextFrame();
    
    if (earlyExit) {
      break;
    }
    
    const now = currentTime();
    if (!pushAwayStart) {
      if (now - start > runDuration) {
        pushAwayStart = now;
      }
    } else if (now - pushAwayStart > pushAwayMaxDuration) {
      break;
    }
  }
}

let lastScreenClearCheck = null;
function screenIsClear() {
  if (lastScreenClearCheck !== null && currentTime() - lastScreenClearCheck < screenClearCheckWaitDuration) {
    return false;
  }
  lastScreenClearCheck = currentTime();
  return allPointsOutOfBounds(gl, gridSource);
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
