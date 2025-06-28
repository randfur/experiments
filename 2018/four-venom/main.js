'use strict';

const TAU = Math.PI * 2;
const dotSpacing = 4;
const simulationSteps = 200;
const ambientColour = 25;
const colourStrength = 60;
const firstPaintMultiplier = 1.25;
const universeHoldDuration = 60;
const universeInterpolationDuration = 60 * 10;
const universeForcedInterpolationDuration = 1;
const mouseSpeed = 1 / 4;
const xAngleTimeLimit = 25;

let debug = null;
let width = null;
let height = null;
let context = null;
let imageData = null;

let mouseX = null;
let mouseY = null;
let targetMouseX = null;
let targetMouseY = null;

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
  window.addEventListener('keypress', keypress);
  window.addEventListener('pointermove', pointermove);
}

function init() {
  debug = false;

  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  imageData = context.createImageData(width, height);

  targetMouseX = 0;
  targetMouseY = -1000;
  mouseX = targetMouseX;
  mouseY = targetMouseY;

  universe = createUniverse();
  universeTotalSeconds = 0;
  interpolatingUniverses = false;
  actionStartTimestamp = 0;
  actionDuration = universeHoldDuration;
}

function createUniverse() {
  const colourAnglePeriod = (1 + random(4)) * width;
  const gravityPointCount = Math.round(2 + random(3));
  let mouseStrength = -20 + random(80);
  if (Math.abs(mouseStrength) < 10)
    mouseStrength = 25;
  return {
    gravityPoints: range(gravityPointCount).map(i => {
      const xAnglePeriod = 10 + random(50);
      return {
        strength: 10 + random(70),
        x: 0,
        y: height / 4 + random(height / 2),
        xCentre: random(width),
        xRadius: random(width / 2),
        xAnglePhase: random(xAnglePeriod / 4),
        xAnglePeriod,
      };
    }),

    colourAnglePeriod,
    colourAnglePhase: random(1),

    dotDdy: random(1 / (20 - gravityPointCount)),
    dotDrag: 1 - (1 / (30 + random(170))),
    minSquareDistance: (10 + random(30)) ** 2,
    mouseStrength,
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
      interpolate(
          i < a.length ? a[i] : null,
          i < b.length ? b[i] : null,
          fraction,
          output[i]);
    }
    return;
  }
  console.assert(output instanceof Object, output);
  for (let key in output) {
    if (typeof output[key] === 'number') {
      output[key] = lerp(
          a ? a[key] : 0,
          b ? b[key] : 0,
          fraction);
    } else {
      interpolate(
          a ? a[key] : null,
          b ? b[key] : null,
          fraction,
          output[key]);
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
  return fraction < 0.5 ? 2 * fraction ** 2 : 1 - 2 * (1 - fraction) ** 2;
}

function limit(x, peak, curve) {
  const topCurved = peak * Math.sqrt(curve / peak + ((x / peak) % 4 - 2) ** 2);
  const bottomCurved = peak * (2 - Math.sqrt(curve / peak + (((x + (peak * 2)) / peak) % 4 - 2) ** 2));
  const curveCrossfade = (Math.cos(x * TAU / 4 / peak) + 1) / 2;
  return topCurved + curveCrossfade * (bottomCurved - topCurved) - peak;
}

function update(deltaSeconds, totalSeconds) {
  universeTotalSeconds += Math.min(deltaSeconds, 1 / 60);
  
  if (universeTotalSeconds > actionStartTimestamp + actionDuration) {
    if (interpolatingUniverses) {
      interpolatingUniverses = false;
      universe = universeTo;
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
    const xAngle = limit(gravityPoint.xAnglePhase + universeTotalSeconds, xAngleTimeLimit, 1) * TAU / Math.max(1, gravityPoint.xAnglePeriod);
    gravityPoint.x = gravityPoint.xCentre + gravityPoint.xRadius * Math.sin(xAngle);
  }

  mouseX += (targetMouseX - mouseX) * mouseSpeed;
  mouseY += (targetMouseY - mouseY) * mouseSpeed;
}

function render() {
  imageData.data.fill(0);
  for (let startX = 0; startX < width; startX += dotSpacing) {
    let fraction = (
        universe.colourAnglePhase + (
            startX / universe.colourAnglePeriod
        )
    ) % 1;
    fraction = fraction < 0 ? 1 + fraction : fraction;
    const rgb = [
      ambientColour + colourStrength * Math.min(1, Math.max(0, Math.abs(fraction - 0.5) * 6 - 1)),
      ambientColour + colourStrength * Math.min(1, Math.max(0, 2 - (Math.abs(fraction - (1 / 3)) * 6))),
      ambientColour + colourStrength * Math.min(1, Math.max(0, 2 - (Math.abs(fraction - (2 / 3)) * 6))),
    ];
    let x = startX;
    let y = height;
    let lastX = x;
    let lastY = y;
    for (let i = 0; i < simulationSteps; ++i) {
      let dx = x - lastX;
      let dy = y - lastY;
      let ddx = 0;
      let ddy = universe.dotDdy;
      function gravitateTowards(gravityX, gravityY, strength) {
        const deltaX = gravityX - x;
        const deltaY = gravityY - y;
        const squareDistance = Math.max(
            universe.minSquareDistance,
            deltaX * deltaX + deltaY * deltaY);
        ddx += deltaX * strength / squareDistance;
        ddy += deltaY * strength / squareDistance;
      }
      for (let gravityPoint of universe.gravityPoints) {
        gravitateTowards(gravityPoint.x, gravityPoint.y, gravityPoint.strength);
      }
      gravitateTowards(mouseX, mouseY, universe.mouseStrength);
      dx += ddx;
      dy += ddy;
      dx *= universe.dotDrag;
      dy *= universe.dotDrag;
      lastX = x;
      lastY = y;
      x += dx;
      y += dy;
      const firstPaint = imageData.data[4 * width * (y | 0) + 4 * (x | 0) + 3] === 0;
      const dotSize = firstPaint ? 2 : 1;
      for (let drawX = 0; drawX < dotSize; ++drawX) {
        for (let drawY = 0; drawY < dotSize; ++drawY) {
          const index = 4 * width * ((y | 0) + drawY) + 4 * ((x | 0) + drawX);
          for (let channel = 0; channel < 3; ++channel) {
            imageData.data[index + channel] += rgb[channel] * (firstPaint ? firstPaintMultiplier : 1);
          }
          imageData.data[index + 3] = 255;
        }
      }
    }
  }
  context.putImageData(imageData, 0, 0);
  if (debug) {
    for (let {x, y, strength} of universe.gravityPoints) {
      context.fillStyle = strength < 0 ? 'purple' : 'blue';
      context.beginPath();
      context.arc(x, y, Math.abs(strength), 0, TAU);
      context.fill();
    }
    context.fillStyle = 'white';
    const scale = 10;
    for (let x = 0; x < width; ++x) {
      let dotSeconds = universeTotalSeconds + (x - width) / scale;
      if (dotSeconds >= 0) {
        context.fillRect(x, height / 2 + scale * limit(dotSeconds, xAngleTimeLimit, 1), 1, 1);
      }
    }
  }
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

function pointermove({clientX, clientY}) {
  targetMouseX = clientX;
  targetMouseY = clientY;
}

function keypress({key}) {
  if (key == 'd') {
    debug ^= true;
  } else {
    forceInterpolation();
  }
}

main();