const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');

const cellSize = 40;
const gridWidth = 1 + Math.ceil(width / cellSize);
const gridHeight = 1 + Math.ceil(height / cellSize);

const topMargin = 82;

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;
let mouseDragging = false;
let mouseDragStartX = 0;
let mouseDragStartY = 0;
let lastPointerDown = 0;

let cameraX = 464 * cellSize;
let cameraY = 208 * cellSize - topMargin;
let cameraDragStartX = 0;
let cameraDragStartY = 0;
let gridZoom = 1;
const gridZoomSpeed = 0.25;
const zoomDoubleTapThreshold = 400;

let selectedCodePoint = null;

function main() {
  registerMouseEvents();
  registerUiEvents();
  scheduleDraw();
}

let drawScheduled = false;
async function scheduleDraw() {
  if (drawScheduled) {
    return;
  }
  drawScheduled = true;
  await new Promise(requestAnimationFrame);
  draw();
  drawScheduled = false;
}

function registerMouseEvents() {
  canvas.addEventListener('pointerdown', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    mouseDown = true;

    const time = performance.now();
    if (!mouseDragging && time - lastPointerDown < zoomDoubleTapThreshold) {
      if (mouseY < height / 2) {
        zoomGridOut();
      } else {
        zoomGridIn();
      }
    }
    lastPointerDown = time;
  });
  canvas.addEventListener('pointermove', event => {
    const lastMouseX = mouseX;
    const lastMouseY = mouseY;
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!mouseDragging) {
      if (mouseDown) {
        const distance = Math.abs(mouseX - lastMouseX) + Math.abs(mouseY - lastMouseY);
        if (distance > 2) {
          mouseDragging = true;
          mouseDragStartX = mouseX;
          mouseDragStartY = mouseY;
          cameraDragStartX = cameraX;
          cameraDragStartY = cameraY;
        }
      }
    } else {
      cameraX = cameraDragStartX - (mouseX - mouseDragStartX);
      cameraY = cameraDragStartY - (mouseY - mouseDragStartY);
      scheduleDraw();
    }
  });
  canvas.addEventListener('pointerup', event => {
    mouseDown = false;
    
    if (!mouseDragging) {
      selectedCodePoint = getCodePointUnderMouse();
      scheduleDraw();
    }
    mouseDragging = false;
  });
  window.addEventListener('wheel', event => {
    if (mouseDragging) {
      return;
    }
    const oldGridZoom = gridZoom;
    if (event.deltaY < 0) {
      zoomGridIn();
    } else if (event.deltaY > 0) {
      zoomGridOut();
    }
  });
}

function getXComponent(xBits) {
  let xComponent = 0;
  let n = 0;
  while (xBits > 0) {
    xComponent |= (xBits & 1) << n;
    n += 2;
    xBits >>= 1;
  }
  return xComponent;
}

function getYComponent(yBits) {
  let yComponent = 0;
  let n = 1;
  while (yBits > 0) {
    yComponent |= (yBits & 1) << n;
    n += 2;
    yBits >>= 1;
  }
  return yComponent;
}

function getCodePointUnderMouse() {
  const xBits = Math.floor(Math.floor((cameraX + mouseX) / cellSize) / gridZoom);
  const yBits = Math.floor(Math.floor((cameraY + mouseY) / cellSize) / gridZoom);
  if (xBits < 0 || yBits < 0) {
    return '';
  }
  return getXComponent(xBits) + getYComponent(yBits);
}

function zoomGridIn() {
  updateGridZoom(Math.min(1, gridZoom * (1 + gridZoomSpeed)));
}

function zoomGridOut() {
  updateGridZoom(gridZoom * (1 - gridZoomSpeed));
}

function updateGridZoom(newGridZoom) {
  if (newGridZoom != gridZoom) {
    cameraX = cellSize * (newGridZoom / gridZoom * (cameraX / cellSize + gridWidth / 2) - gridWidth / 2);
    cameraY = cellSize * (newGridZoom / gridZoom * (cameraY / cellSize + gridHeight / 2) - gridHeight / 2);
    gridZoom = newGridZoom;
    scheduleDraw();
  }
}

function registerUiEvents() {
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(unicodeDisplay.textContent);
  });
}

function modulo(x, n) {
  return ((x % n) + n) % n;
}

function draw() {
  context.clearRect(0, 0, width, height);

  context.font = `${cellSize * 0.8}px monospace`;
  const cameraGridX = Math.floor(cameraX / cellSize);
  const cameraGridY = Math.floor(cameraY / cellSize);
  for (let xi = 0; xi < gridWidth; ++xi) {
    const xBits = Math.floor((cameraGridX + xi) / gridZoom);
    if (xBits < 0) {
      continue;
    }
    const xComponent = getXComponent(xBits);

    for (let yi = 0; yi < gridHeight; ++yi) {
      let yBits = Math.floor((cameraGridY + yi) / gridZoom);
      if (yBits < 0) {
        continue;
      }

      const codePoint = xComponent + getYComponent(yBits);
      const plane = codePoint >> 16;
      if (plane >= 16) {
        continue;
      }
      
      const x = xi * cellSize - modulo(cameraX, cellSize);
      const y = yi * cellSize - modulo(cameraY, cellSize);
      context.fillStyle = `#000${plane.toString(16)}`;
      context.fillRect(x, y, cellSize, cellSize);
      context.fillStyle = plane >= 12 ? 'white' : 'black';
      try { context.fillText(String.fromCodePoint(codePoint), x, y + cellSize); } catch {}
    }
  }
  
  zoomUi.textContent = (gridZoom * 100).toFixed(0);
  
  copyButton.disabled = !selectedCodePoint;
  codePointDecimalDisplay.textContent = selectedCodePoint ?? '';
  codePointHexDisplay.textContent = selectedCodePoint ? `U+${selectedCodePoint.toString(16).toUpperCase()}` : '';
  unicodeDisplay.textContent = selectedCodePoint ? String.fromCodePoint(selectedCodePoint) : '';
}

main();