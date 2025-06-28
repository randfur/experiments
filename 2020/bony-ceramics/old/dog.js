const width = window.innerWidth;
const height = window.innerHeight;
const lineWidth = 2;
const fontImageScaleX = 1.28;
const fontImageScaleY = 0.55;

const viewCanvas = document.getElementById('canvas');
viewCanvas.width = width;
viewCanvas.height = height;
const viewContext = viewCanvas.getContext('2d');
viewContext.imageSmoothingEnabled = false;

const bitmapCanvas = new OffscreenCanvas(width, height);
const bitmapContext = bitmapCanvas.getContext('2d');

let bitmapX = 0;
let bitmapY = 0;
let bitmapZoom = 1;

let stamp = false;
let fontSize = 12;

function drawBitmapStamp(x, y) {
  bitmapContext.font = `${fontSize}px monospace`;
  bitmapContext.fillText(
    stampText.value,
    x - fontSize * fontImageScaleX / 2,
    y + fontSize * fontImageScaleY / 2);
}

function drawBitmapDot(x, y) {
  bitmapContext.fillRect(
    Math.round(x - lineWidth / 2),
    Math.round(y - lineWidth / 2),
    lineWidth, lineWidth);
}

function drawViewDot(x, y) {
  drawBitmapDot(viewToBitmapX(x), viewToBitmapY(y));
}

function viewToBitmapX(x) {
  return (x - bitmapX) / bitmapZoom;
}

function viewToBitmapY(y) {
  return (y - bitmapY) / bitmapZoom;
}

function bitmapToViewX(x) {
  return bitmapX + x * bitmapZoom;
}

function bitmapToViewY(y) {
  return bitmapY + y * bitmapZoom;
}

let mouseX = 0;
let mouseY = 0;
let mouseIsDown = false;

viewCanvas.addEventListener('mousedown', event => {
  mouseIsDown = true;
  drawViewDot(mouseX, mouseY);
});

viewCanvas.addEventListener('mouseup', event => {
  mouseIsDown = false;
});

viewCanvas.addEventListener('mousewheel', event => {
  const lastZoom = bitmapZoom;
  bitmapZoom = Math.max(1, bitmapZoom * Math.pow(2, -Math.sign(event.deltaY) * 0.1));

  // Get mouse position (view coordinates) in terms of bitmap coordinates.
  let mouseBitmapX = viewToBitmapX(mouseX);
  let mouseBitmapY = viewToBitmapY(mouseY);

  // Apply zoom to it.
  mouseBitmapX *= bitmapZoom / lastZoom;
  mouseBitmapY *= bitmapZoom / lastZoom;

  // Put back into view coordinates.
  // Get the difference and translate bitmap by that much.
  bitmapX -= bitmapToViewX(mouseBitmapX) - mouseX;
  bitmapY -= bitmapToViewY(mouseBitmapY) - mouseY;
});

viewCanvas.addEventListener('mousemove', event => {
  const nextMouseX = event.offsetX;
  const nextMouseY = event.offsetY;
  
  if (mouseIsDown) {
    if (stamp) {
      drawBitmapStamp(viewToBitmapX(mouseX), viewToBitmapY(mouseY));
    } else {
      const dx = nextMouseX - mouseX;
      const dy = nextMouseY - mouseY;
      if (Math.abs(dx) > Math.abs(dy)) {
        const slope = dy / dx;
        for (let x = mouseX; x != nextMouseX; x += Math.sign(dx))
          drawViewDot(x, mouseY + (x - mouseX) * slope);
      } else {
        const slope = dx / dy;
        for (let y = mouseY; y != nextMouseY; y += Math.sign(dy))
          drawViewDot(mouseX + (y - mouseY) * slope, y);
      }
    }
  }
  
  mouseX = nextMouseX;
  mouseY = nextMouseY;
});

function draw() {
  viewContext.clearRect(0, 0, width, height);
  viewContext.drawImage(bitmapCanvas, bitmapX, bitmapY, width * bitmapZoom, height * bitmapZoom);
  
  // Minimap.
  // Background.
  const minimapWidth = 300;
  const minimapZoom = minimapWidth / width;
  const minimapX = width - minimapWidth;
  const minimapY = 0;
  viewContext.fillStyle = '#dddd';
  viewContext.fillRect(minimapX, minimapY, minimapWidth, height * minimapZoom);
  // Map.
  viewContext.drawImage(bitmapCanvas, minimapX, minimapY, minimapWidth, height * minimapZoom);
  // Minimap viewport.
  viewContext.strokeStyle = 'black';
  viewContext.strokeRect(
    minimapX - bitmapX / bitmapZoom * minimapZoom,
    minimapY - bitmapY / bitmapZoom * minimapZoom,
    minimapWidth / bitmapZoom,
    height * minimapZoom / bitmapZoom);
}

function nextFrame() {
  return new Promise(requestAnimationFrame);
}

async function main() {
  while (true) {
    await nextFrame();
    draw();
  }
}
main();