const gridSize = 8;
const width = Math.max(window.innerWidth / gridSize);
const height = Math.max(window.innerHeight / gridSize);
const context = canvas.getContext('2d');

async function main() {
  canvas.width = width;
  canvas.height = height;
  canvas.style.transformOrigin = 'top left';
  canvas.style.transform = `scale(${gridSize})`;
  canvas.style.imageRendering = 'pixelated';

  const dotCount = 10;
  const stepCount = 1000;
  let startDots = createDots(dotCount, stepCount);
  let endDots = createDots(dotCount, stepCount);
  let durationMultiplier = 10;
  
  window.addEventListener('keydown', event => {
    const zeroKeyCode = 48;
    if (event.keyCode >= zeroKeyCode  && event.keyCode < zeroKeyCode + 10) {
      durationMultiplier = event.keyCode - zeroKeyCode;
    }
  });
  
  let firstRun = true;
  while (true) {
    const frameCount = firstRun ? 1 : Math.max(1, 200 * durationMultiplier);
    firstRun = false;
    const dotDelayMax = Math.floor(frameCount / 25);
    const stepDelayMax = Math.floor(frameCount / 25);
    for (let i = 0; i < frameCount; ++i) {
      context.clearRect(0, 0, width, height);

      for (let j = 0; j < dotCount; ++j) {
        const startDot = startDots[j];
        const endDot = endDots[j];
        context.fillStyle = j % 3 == 0 ? '#a00' : '#b00'
        const dotDelay = dotDelayMax * getProgress(j, dotCount);

        for (let k = 0; k < stepCount; ++k) {
          const stepDelay = stepDelayMax * (1 - getProgress(k, stepCount));
          const progress = Math.min(1, Math.max(0, getProgress(i - dotDelay - stepDelay, frameCount - dotDelayMax - stepDelayMax)));
          context.fillRect(
            Math.round(width / 2 + lerp(startDot.xs[k], endDot.xs[k], progress)),
            Math.round(height / 2 + lerp(startDot.ys[k], endDot.ys[k], progress)),
            1,
            1,
          );
        }
      }
      await new Promise(requestAnimationFrame);
    }

    await Promise.race([
      userSignal(),
      sleep(10000 + Math.random() * 10000),
    ]);

    startDots = endDots;
    endDots = createDots(dotCount, stepCount);
  }
}

function getProgress(i, n) {
  return n > 1 ? i / (n - 1) : 1;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function userSignal() {
  return new Promise(resolve => {
    function clearAndResolve() {
      window.removeEventListener('keydown', clearAndResolve);
      window.removeEventListener('click', clearAndResolve);
      resolve();
    }
    window.addEventListener('keydown', clearAndResolve);
    window.addEventListener('click', clearAndResolve);
  });
}

function createDots(dotCount, stepCount) {
  const dots = [];
  for (let i = 0; i < dotCount; ++i) {
    let x = 0;
    let y = 0;
    let maxDistance = 0;
    let maxX = 0;
    let maxY = 0;
    const xs = [];
    const ys = [];
    for (let i = 0; i < stepCount; ++i) {
      if (Math.random() < 1 / 2) {
        x += randomMovement();
      } else {
        y += randomMovement();
      }
      const distance = Math.abs(x) + Math.abs(y);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxX = x;
        maxY = y;
      }
      xs.push(x);
      ys.push(y);
    }
    dots.push({
      xs,
      ys,
      maxX,
      maxY,
    });
  }
  
  dots.sort((a, b) => Math.atan2(a.maxY, a.maxX) - Math.atan2(b.maxY, b.maxX));
  
  return dots;
}

function sleep(n) {
  return new Promise(resolve => {
    setTimeout(resolve, n);
  });
}
  
function randomMovement() {
  return Math.random() < 0.5 ? -1 : 1;
}

function range(n) {
  let result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

main();