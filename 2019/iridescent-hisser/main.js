'use strict';

// Math.
const TAU = 2 * Math.PI;

// Page.
let width = null;
let height = null;
let context = null;
let imageData = null;

// Interaction.
let mouseX = 0;
let mouseY = 0;
let zoomLevel = 0;
let zoomFraction = 1;
let stepRate = 1;

// Visual style.
const zoomRate = 1.125;
const scale = 4;
const redMin = 0;
const redScale = 10;
const greenMin = -1;
const greenScale = 100;
const blueMin = 20;
const blueScale = 5;

// Simulation parameters.
const count = 2000;
const speed = 0.67;
const radius = 5;
const turnAngle = 17 / 360 * TAU;
const jitter = 0;

// Simulation state.
let prevXs = null;
let prevYs = null;
let xs = null;
let ys = null;
let dxs = null;
let dys = null;
let neighbourCounts = null;

// Nearest points grid look up optimisation.
let grid = null;
let gridWidth = null;
let gridHeight = null;

function main() {
  init();
  everyFrame((deltaSeconds, totalSeconds) => {
    update(deltaSeconds, totalSeconds);
    render();
  });

  window.addEventListener('resize', init);
  window.addEventListener('click', init);
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('mousewheel', mousewheel);
  window.addEventListener('keydown', keydown);
}

function init() {
  // Page.
  width = (window.innerWidth / scale) | 0;
  height = (window.innerHeight / scale) | 0;
  canvas.width = width;
  canvas.height = height;
  canvas.style.transform = `scale(${scale})`;
  context = canvas.getContext('2d');
  imageData = context.createImageData(width, height);
  
  // Interaction.
  mouseX = width / 2;
  mouseY = height / 2;

  // Simulation state.
  const angles = buildList(count, _ => random(TAU));
  xs = buildList(count, i => width / 2 + Math.cos(angles[i]) * 4 * radius);
  ys = buildList(count, i => height / 2 + Math.sin(angles[i]) * 4 * radius);
  // xs = buildList(count, i => random(width));
  // ys = buildList(count, i => random(height));
  dxs = buildList(count, i => speed * Math.cos(angles[i]));
  dys = buildList(count, i => speed * Math.sin(angles[i]));
  prevXs = buildList(count, i => xs[i]);
  prevYs = buildList(count, i => ys[i]);
  neighbourCounts = buildList(count, _ => 0);

  // Grid optimisation.
  grid = [];
  gridWidth = Math.ceil(width / radius);
  gridHeight = Math.ceil(height / radius);
  for (let gx = 0; gx < gridWidth; ++gx) {
    const gridColumn = [];
    for (let gy = 0; gy < gridHeight; ++gy) {
      // Last index contains array population size.
      const gridCell = new Int16Array(count + 1);
      gridColumn.push(gridCell);
    }
    grid.push(gridColumn);
  }
}

function buildList(n, f) {
  const result = new Float32Array(n);
  for (let i = 0; i < n; ++i) {
    result[i] = f(i);
  }
  return result;
}

function random(x) {
  return Math.random() * x;
}
                                              
function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function update(deltaSeconds, totalSeconds) {
  for (let step = 0; step < stepRate; ++step) {
    // Swap old/new co-ordinates.
    let temp = prevXs;
    prevXs = xs;
    xs = temp;
    temp = prevYs;
    prevYs = ys;
    ys = temp;

    // Reset grid.
    for (let gx = 0; gx < gridWidth; ++gx) {
      for (let gy = 0; gy < gridHeight; ++gy) {
        grid[gx][gy][count] = 0;
      }
    }
    // Re-populate grid.
    for (let i = 0; i < count; ++i) {
      const x = Math.max(0, Math.min(width - 1, prevXs[i]));
      const y = Math.max(0, Math.min(height - 1, prevYs[i]));
      const gridCell = grid[(x / radius) | 0][(y / radius) | 0];
      gridCell[gridCell[count]] = i;
      gridCell[count] += 1;
    }

    // For each point.
    for (let i = 0; i < count; ++i) {
      let x = prevXs[i];
      let y = prevYs[i];
      let dx = dxs[i];
      let dy = dys[i];

      // Count other points on left/right within radius.
      let leftNear = 0;
      let rightNear = 0;
      const gx = (x / radius) | 0;
      const gy = (y / radius) | 0;
      const gxMin = Math.max(0, gx - 1);
      const gxMax = Math.min(gridWidth - 1, gx + 1);
      const gyMin = Math.max(0, gy - 1);
      const gyMax = Math.min(gridHeight - 1, gy + 1);
      for (let gx = gxMin; gx <= gxMax; ++gx) {
        for (let gy = gyMin; gy <= gyMax; ++gy) {
          const gridCell = grid[gx][gy];
          for (let gi = 0; gi < gridCell[count]; ++gi) {
            // Other point candidate.
            const j = gridCell[gi];
            if (j == i) {
              continue;
            }
            const jdx = prevXs[j] - x;
            const jdy = prevYs[j] - y;
            if (jdx * jdx + jdy * jdy > radius * radius) {
              continue;
            }
            if (jdx * dy - jdy * dx > 0) {
              rightNear += 1;
            } else {
              leftNear += 1;
            }
          }  
        }
      }
      const neighbourCount = leftNear + rightNear;

      // Flip then turn towards side with most neighbours relative to how many neighbours there are.
      dx *= -1;
      dy *= -1;
      if (leftNear != rightNear) {
        const turns = neighbourCount * (leftNear > rightNear ? 1 : -1);
        const turnAngleX = Math.cos(turns * turnAngle);
        const turnAngleY = Math.sin(turns * turnAngle);
        const newDx = dx * turnAngleX - dy * turnAngleY;
        const newDy = dx * turnAngleY + dy * turnAngleX;
        dx = newDx;
        dy = newDy;
      }
      
      dx += deviate(jitter);
      dy += deviate(jitter);

      // Normalise velocity.
      const currentSpeed = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
      dx *= speed / currentSpeed;
      dy *= speed / currentSpeed;

      x += dx;
      y += dy;

      xs[i] = x;
      ys[i] = y;
      dxs[i] = dx;
      dys[i] = dy;
      neighbourCounts[i] = neighbourCount;
    }
  }
}

function render() {
  imageData.data.fill(0);
  for (let i = 0; i < count; ++i) {
    const n = neighbourCounts[i];
    drawZoomedLine(prevXs[i], prevYs[i], xs[i], ys[i], n);
  }
  context.putImageData(imageData, 0, 0);
}

function drawZoomedLine(x1, y1, x2, y2, n) {
  x1 = (mouseX + zoomFraction * (x1 - mouseX)) | 0;
  y1 = (mouseY + zoomFraction * (y1 - mouseY)) | 0;
  x2 = (mouseX + zoomFraction * (x2 - mouseX)) | 0;
  y2 = (mouseY + zoomFraction * (y2 - mouseY)) | 0;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx == 0 && dy == 0) {
    drawDot(x1, y1, n);
  } else if (Math.abs(dx) > Math.abs(dy)) {
    const slope = dy / dx;
    const step = dx > 0 ? 1 : -1;
    for (let x = x1; x != x2 + step; x += step) {
      drawDot(x, y1 + slope * (x - x1), n);
    }
  } else {
    const slope = dx / dy;
    const step = dy > 0 ? 1 : -1;
    for (let y = y1; y != y2 + step; y += step) {
      drawDot(x1 + slope * (y - y1), y, n);
    }
  }
}

function drawDot(x, y, n) {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return;
  }
  const index = 4 * width * (y | 0) + 4 * (x | 0);
  imageData.data[index + 0] = (n - redMin) * redScale;
  imageData.data[index + 1] = (n - greenMin) * greenScale;
  imageData.data[index + 2] = (n - blueMin) * blueScale;
  imageData.data[index + 3] = 255;
}

function mousemove({clientX, clientY}) {
  mouseX = clientX / scale;
  mouseY = clientY / scale;
}

function mousewheel({wheelDelta}) {
  zoomLevel += wheelDelta > 0 ? 1 : -1;
  zoomFraction = Math.pow(zoomRate, zoomLevel);
}

function keydown({key}) {
  if (key == 'ArrowUp') {
    stepRate += 1;
  } else if (key == 'ArrowDown') {
    stepRate = Math.max(0, stepRate - 1);
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

main();