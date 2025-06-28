'use strict';

const TAU = Math.PI * 2;
const dotSpacing = 4;
const simulationSteps = 200;
const dotSize = 1;
const ambientColour = 15;
const colourStrength = 50;
const universeHoldDuration = 30;
const universeInterpolationDuration = 60;
const universeForcedInterpolationDuration = 0.5;

let width = null;
let height = null;
let context = null;
let imageData = null;

let universeFrom = null;
let universeTo = null;
let universe = null;
let universeTotalSeconds = null;
let interpolatingUniverses = null;
let actionStartTimestamp = null;
let actionDuration = null;

function main() {
  init();
  everyFrame((deltaSeconds, totalSeconds) => {
    update(deltaSeconds, totalSeconds);
    render();
  });

  window.addEventListener('resize', init);
  window.addEventListener('click', click);
  window.addEventListener('keypress', forceInterpolation);
}

function init() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  imageData = context.createImageData(width, height);

  universe = createUniverse();
  universeTotalSeconds = 0;
  interpolatingUniverses = false;
  actionStartTimestamp = 0;
  actionDuration = universeHoldDuration;
}

function createUniverse() {
  const colourAnglePeriod = width + random(2 * width);
  const gravityPointCount = Math.ceil(2 + random(8));
  return {
    gravityPoints: range(gravityPointCount).map(_ => ({
      strength: (gravityPointCount > 1 ? -5 : 10) + random(100),
      x: 0,
      y: height / 3 + random(height / 3),
      xCentre: random(width),
      xRadius: random(width / 2),
      xAnglePhase: random(TAU),
      xAngleSpeed: deviate(TAU / 50),
    })),

    colourAnglePeriod,
    colourAnglePhase: random(1),

    dotDdy: random(1 / 10),
    dotDrag: 1 - (1 / (10 + random(300))),
    minSquareDistance: random(40) ** 2,
  };
}

function mergeUniverses(universeA, universeB) {
  const mergedUniverse = {...universeA};
  mergedUniverse.gravityPoints = universeA.gravityPoints.map(gravityPoint => ({...gravityPoint}));
  while (universeB.gravityPoints.length > mergedUniverse.gravityPoints.length) {
    mergedUniverse.gravityPoints.push({...universeB.gravityPoints[0], strength: 0});
  }
  return mergedUniverse;
}

function interpolate(a, b, fraction, output) {
  if (output instanceof Array) {
    console.assert(a instanceof Array);
    console.assert(b instanceof Array);
    for (let i = 0; i < output.length; ++i) {
      console.assert(output[i] instanceof Object);
      interpolate(i < a.length ? a[i] : null, i < b.length ? b[i] : null, fraction, output[i]);
    }
    return;
  }
  console.assert(output instanceof Object, output);
  for (let key in output) {
    if (typeof output[key] === 'number') {
      output[key] = lerp(a ? a[key] : 0, b ? b[key] : 0, fraction);
    } else {
      interpolate(a ? a[key] : null, b ? b[key] : null, fraction, output[key]);
    }
  }
}

function interpolateToNewUniverse(duration) {
  universeFrom = universe;
  universeTo = createUniverse();
  universe = mergeUniverses(universeFrom, universeTo);
  interpolatingUniverses = true;
  actionStartTimestamp = universeTotalSeconds;
  actionDuration = duration;
}

function lerp(a, b, fraction) {
  return a + (b - a) * fraction;
}

function range(n) {
  let result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function random(x) {
  return Math.random() * x;
}
                                              
function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function smoothFraction(fraction) {
  return fraction < 0.5 ? 2 * fraction ** 2 : 1 - 2 * (1 - fraction) ** 2
}

function update(deltaSeconds, totalSeconds) {
  deltaSeconds = 1 / 60;
  universeTotalSeconds += deltaSeconds;
  
  if (universeTotalSeconds > actionStartTimestamp + actionDuration) {
    if (interpolatingUniverses) {
      universe = universeTo;
      interpolatingUniverses = false;
      actionStartTimestamp = universeTotalSeconds;
      actionDuration = universeHoldDuration;
    } else {
      interpolateToNewUniverse(universeInterpolationDuration);
    }
  }

  if (interpolatingUniverses) {
    interpolate(universeFrom, universeTo, smoothFraction((universeTotalSeconds - actionStartTimestamp) / actionDuration), universe);
  }
  
  for (let gravityPoint of universe.gravityPoints) {
    const xAngle = gravityPoint.xAnglePhase + universeTotalSeconds * gravityPoint.xAngleSpeed;
    gravityPoint.x = gravityPoint.xCentre + gravityPoint.xRadius * Math.sin(xAngle);
  }
}

function render() {
  imageData.data.fill(0);
  for (let startX = 0; startX < width; startX += dotSpacing) {
    let fraction = (universe.colourAnglePhase + (startX / universe.colourAnglePeriod)) % 1;
    fraction = fraction < 0 ? 1 + fraction : fraction;
    const r = ambientColour + colourStrength * Math.min(1, Math.max(0, Math.abs(fraction - 0.5) * 6 - 1));
    const g = ambientColour + colourStrength * Math.min(1, Math.max(0, 2 - (Math.abs(fraction - (1 / 3)) * 6)));
    const b = ambientColour + colourStrength * Math.min(1, Math.max(0, 2 - (Math.abs(fraction - (2 / 3)) * 6)));
    let x = startX;
    let y = height;
    let lastX = x;
    let lastY = y;
    for (let i = 0; i < simulationSteps; ++i) {
      let dx = x - lastX;
      let dy = y - lastY;
      let ddx = 0;
      let ddy = universe.dotDdy;
      for (let gravityPoint of universe.gravityPoints) {
        const deltaX = gravityPoint.x - x;
        const deltaY = gravityPoint.y - y;
        const squareDistance = Math.max(universe.minSquareDistance, deltaX * deltaX + deltaY * deltaY);
        ddx += deltaX * gravityPoint.strength / squareDistance;
        ddy += deltaY * gravityPoint.strength / squareDistance;
      }
      dx += ddx;
      dy += ddy;
      dx *= universe.dotDrag;
      dy *= universe.dotDrag;
      lastX = x;
      lastY = y;
      x += dx;
      y += dy;
      for (let drawX = 0; drawX < dotSize; ++drawX) {
        for (let drawY = 0; drawY < dotSize; ++drawY) {
          const index = 4 * width * ((y | 0) + drawY) + 4 * ((x | 0) + drawX);
          imageData.data[index + 0] += r;
          imageData.data[index + 1] += g;
          imageData.data[index + 2] += b;
          imageData.data[index + 3] = 255;
        }
      }
    }
  }
  context.putImageData(imageData, 0, 0);
  // for (let {x, y, strength} of gravityPoints) {
  //   context.fillStyle = strength < 0 ? 'purple' : 'blue';
  //   context.beginPath();
  //   context.arc(x, y, Math.abs(strength), 0, TAU);
  //   context.fill();
  // }
}

let lastTimeSeconds = performance.now() / 1000;
function everyFrame(f) {
  function loop(timeMilliseconds) {
    const timeSeconds = timeMilliseconds / 1000;
    f(timeSeconds - lastTimeSeconds, timeSeconds);
    lastTimeSeconds = timeSeconds;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function print(text) {
  output.textContent += text + '\n';
}

function click({button}) {
  if (button == 0) {
    forceInterpolation();
  }
}

function forceInterpolation() {
  interpolateToNewUniverse(universeForcedInterpolationDuration);
}

main();