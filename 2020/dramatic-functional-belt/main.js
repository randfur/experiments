import {
  clearLog,
  log,
  smoothLerp,
} from './utils.js';
import {generateExpression} from './expr.js';

const gridStep = 30;
const gridExtra = 0.1;
const curveSegments = 6;
const maxMagnitude = 1;
const timeScale = 1 / 1000;
const curveColour = '#52f';
const curveSize = 1;
const pointColour = 'white';
const pointSize = 0;

const defaultTransitionDuration = 10000;
const quickTransitionDuration = 300;
const quickenNextTransitionLimit = 4000;

const cursorPushForce = 0.125;
const cursorPushMaxForceRadius = 0.2;
const cursorPushDuration = 4000;
const cursorPushRampUpDrag = 10;
const cursorPositionDrag = 2;

const sampleStep = 1 / 10;
const sampleTime = 1;

const width = window.innerWidth;
const height = window.innerHeight;
const minWidthHeight = Math.min(width, height);

let context = null;
let time = 0;

let debug = false;

let fromField = null;
let toField = null;
let transitionStartTime = null;
let transitionDuration = null;
let pendingQuickens = null;

let cursorScreenX = width / 2;
let cursorScreenY = height / 2;
let lastCursorMove = -cursorPushDuration;
let targetCursorScreenX = width / 2;
let targetCursorScreenY = height / 2;
let targetLastCursorMove = -cursorPushDuration;


function init() {
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  context.strokeStyle = curveColour;
  context.lineWidth = curveSize;
  context.fillStyle = pointColour;

  fromField = createField();
  toField = createField();
  transitionStartTime = time;
  transitionDuration = defaultTransitionDuration;
  pendingQuickens = 0;

  window.addEventListener('click', quicken);
  window.addEventListener('keydown', event => {
    if (event.key == 'd') {
      debug ^= true;
      if (!debug) {
        clearLog();
      }
    } else {
      quicken();
    }
  });
  window.addEventListener('pointermove', event => {
    targetCursorScreenX = event.clientX;
    targetCursorScreenY = event.clientY;
    targetLastCursorMove = time;
  });
}

function createField() {
  let attemptsLeft = 4;
  while (true) {
    attemptsLeft -= 1;
    const xExpr = generateExpression();
    const yExpr = generateExpression();
    const xFunc = new Function('x', 'y', 'time', `return ${xExpr};`);
    const yFunc = new Function('x', 'y', 'time', `return ${yExpr};`);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let maxSquareLength = 0;
    let validityCheck = 0;
    for (let x = -1; x < 1; x += sampleStep) {
      for (let y = -1; y < 1; y += sampleStep) {
        const newX = xFunc(x, y, sampleTime);
        const newY = yFunc(x, y, sampleTime);
        validityCheck += 0 * newX + 0 * newY;
        minX = Math.min(minX, newX);
        maxX = Math.max(maxX, newX);
        minY = Math.min(minY, newY);
        maxY = Math.max(maxY, newY);
        maxSquareLength = Math.max(maxSquareLength, newX ** 2 + newY ** 2);
      }
    }
    if (attemptsLeft > 0) {
      if (maxSquareLength == Infinity || validityCheck !== 0) {
        continue;
      }
      const minRatio = 0.01;
      const ratio = (maxX - minX) / (maxY - minY);
      if (ratio < minRatio || ratio > 1 / minRatio) {
        continue;
      }
    }
    return {
      expr: [xExpr, yExpr],
      func: [xFunc, yFunc],
      startTime: time,
      adjust: [-(minX + maxX) / 2, -(minY + maxY) / 2],
      scale: maxMagnitude / Math.sqrt(maxSquareLength),
    };
  }
}

function evaluateField(field, dimension, x, y, time) {
  return (field.func[dimension](x, y, (time - field.startTime) * timeScale) + field.adjust[dimension]) * field.scale;
}

function quicken() {
  if (time - transitionStartTime > transitionDuration - quickenNextTransitionLimit) {
    pendingQuickens += 1;
  }
  const transitionProgress = (time - transitionStartTime) / transitionDuration;
  transitionDuration = quickTransitionDuration / Math.max(1, pendingQuickens);
  transitionStartTime = time - transitionProgress * transitionDuration;
}

function screenToGridX(screenX) {
  return (screenX - width / 2) / (minWidthHeight / 2);
}

function screenToGridY(screenY) {
  return -(screenY - height / 2) / (minWidthHeight / 2);
}

function gridToScreenX(gridX) {
  return width / 2 + gridX * (minWidthHeight / 2);
}

function gridToScreenY(gridY) {
  return height / 2 - gridY * (minWidthHeight / 2);
}

function updateCursorSmoothly() {
  cursorScreenX += (targetCursorScreenX - cursorScreenX) / cursorPositionDrag;
  cursorScreenY += (targetCursorScreenY - cursorScreenY) / cursorPositionDrag;
  lastCursorMove = Math.max(lastCursorMove, time - cursorPushDuration);
  lastCursorMove += (targetLastCursorMove - lastCursorMove) / cursorPushRampUpDrag;
}

const endPoints = [];
function render() {
  if (debug) {
    clearLog();
    log('fromTime: ' + ((time - fromField.startTime) * timeScale).toFixed(2));
    log('toTime: ' + ((time - toField.startTime) * timeScale).toFixed(2));
    log('transitionProgress: ' + ((time - transitionStartTime) / transitionDuration).toFixed(2));
    log('fromField: ' + JSON.stringify(fromField, null, '  '));
    log('toField: ' + JSON.stringify(toField, null, '  '));
  }
  
  context.clearRect(0, 0, width, height);
  context.beginPath();
  const xStep = gridStep;
  const yStep = Math.sqrt(3) / 2 * gridStep;
  let oddRow = true;
  let pointCount = 0;
  let validityCheck = 0;
  const cursorGridX = screenToGridX(cursorScreenX);
  const cursorGridY = screenToGridY(cursorScreenY);
  const cursorPushFade = Math.max(0, smoothLerp(1, 0, (time - lastCursorMove) / cursorPushDuration));
  for (let screenY = -height * gridExtra; screenY < height * (1 + gridExtra); screenY += yStep) {
    oddRow ^= true;
    const gridY = screenToGridY(screenY);
    for (let screenX = -width * gridExtra + (oddRow ? xStep / 2 : 0); screenX < width * (1 + gridExtra); screenX += xStep) {
      const gridX = screenToGridX(screenX);
      pointCount += 1;
      // Circle area.
      // if ((x * x + y * y) > 1) {
      //   continue;
      // }
      const transitionProgress = (time - transitionStartTime) / transitionDuration;
      context.moveTo(screenX, screenY);

      let currX = gridX;
      let currY = gridY;
      for (let i = 0; i < curveSegments; ++i) {
        const cursorDeltaX = currX - cursorGridX;
        const cursorDeltaY = currY - cursorGridY;
        const clampedCursorDistance = Math.max(cursorPushMaxForceRadius ** 2, cursorDeltaX ** 2 + cursorDeltaY ** 2);
        const pushForce = cursorPushForce * cursorPushFade / (clampedCursorDistance / cursorPushMaxForceRadius ** 2);
        const pushX = cursorDeltaX * pushForce;
        const pushY = cursorDeltaY * pushForce;

        const fromX = currX + evaluateField(fromField, 0, currX, currY, time) / curveSegments;
        const fromY = currY + evaluateField(fromField, 1, currX, currY, time) / curveSegments;
        const toX = currX + evaluateField(toField, 0, currX, currY, time) / curveSegments;
        const toY = currY + evaluateField(toField, 1, currX, currY, time) / curveSegments;
        currX = smoothLerp(fromX, toX, transitionProgress) + pushX;
        currY = smoothLerp(fromY, toY, transitionProgress) + pushY;
        context.lineTo(gridToScreenX(currX), gridToScreenY(currY));
      }
      validityCheck += currX * 0 + currY * 0;
      if (pointSize > 0) {
        if (pointCount * 2 > endPoints.length) {
          endPoints.push(0, 0);
        }
        endPoints[(pointCount - 1) * 2 + 0] = currX;
        endPoints[(pointCount - 1) * 2 + 1] = currY;
      }
    }
  }
  context.stroke();

  if (transitionDuration == defaultTransitionDuration) {
    if (validityCheck != 0) {
      console.log('Explosion', fromField.expr, toField.expr);
      quicken();
    }
  }
  
  if (pointSize > 0) {
    context.beginPath();
    for (let i = 0; i < pointCount; ++i) {
      context.rect(
          width / 2 + endPoints[i * 2 + 0] * (minWidthHeight / 2) - pointSize / 2,
          height / 2 - endPoints[i * 2 + 1] * (minWidthHeight / 2) - pointSize / 2,
          pointSize, pointSize);
    }
    context.fill();
  }
}

function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(newTime => {
    time = newTime;
    resolve();
  }));
}

function incrementFields() {
  fromField = toField;
  toField = createField();
  const transitionOverProgress = ((time - transitionStartTime) % transitionDuration) / transitionDuration;
  transitionDuration = pendingQuickens > 0 ? (quickTransitionDuration / pendingQuickens) : defaultTransitionDuration;
  pendingQuickens = Math.max(0, pendingQuickens - 1);
  transitionStartTime = time - transitionDuration * transitionOverProgress;
}

async function main() {
  init();
  while (true) {
    await nextFrame();
    if (time - transitionStartTime > transitionDuration) {
      incrementFields();
    }
    updateCursorSmoothly();
    render();
  }
}
main();