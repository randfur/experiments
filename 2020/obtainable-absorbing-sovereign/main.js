'use strict';

async function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

async function main() {
  canvas.width = 1 << 12;
  canvas.height = 1 << 12;
  const context = canvas.getContext('2d');
  
  let canvasX = 0;
  let canvasY = 0;
  let dragging = false;
  const dragScaleFactor = 1;
  let dragMouseStartX = 0;
  let dragMouseStartY = 0;
  let dragCanvasStartX = 0;
  let dragCanvasStartY = 0;
  window.addEventListener('pointerdown', event => {
    dragging = true;
    dragMouseStartX = event.clientX;
    dragMouseStartY = event.clientY;
    dragCanvasStartX = canvasX;
    dragCanvasStartY = canvasY;
  });
  window.addEventListener('pointerup', event => {
    dragging = false;
  });
  window.addEventListener('pointermove', event => {
    if (!dragging) {
      return;
    }
    canvasX = dragCanvasStartX + (event.clientX - dragMouseStartX) * dragScaleFactor;
    canvasY = dragCanvasStartY + (event.clientY - dragMouseStartY) * dragScaleFactor;
    canvasX = Math.max(Math.min(canvasX, 0), -(canvas.width - innerWidth));
    canvasY = Math.max(Math.min(canvasY, 0), -(canvas.height - innerHeight));
    canvas.style.transform = `translate(${canvasX}px, ${canvasY}px)`;
  });

  let time = 0;
  for (let r = 0; r < 256; ++r) {
    for (let g = 0; g < 256; ++g) {
      if (performance.now() - time > 15) {
        time = await nextFrame();
        output.textContent = `${(100 * r / 255).toFixed(0)}%, ${(time / 1000).toFixed(1)}s`;
      }
      for (let b = 0; b < 256; ++b) {
        const x = (r & 0b10000000) << 4 | (g & 0b10000000) << 3 | (b & 0b10000000) << 2 |
                  (r & 0b1000000) << 2  | (g & 0b1000000) << 1  | (b & 0b1000000)       |
                  (r & 0b100000)        | (g & 0b100000) >> 1   | (b & 0b100000) >> 2   |
                  (r & 0b10000) >> 2    | (g & 0b10000) >> 3    | (b & 0b10000) >> 4;
        const y = (r & 0b1000) << 8     | (g & 0b1000) << 7     | (b & 0b1000) << 6     |
                  (r & 0b100) << 6      | (g & 0b100) << 5      | (b & 0b100) << 4      |
                  (r & 0b10) << 4       | (g & 0b10) << 3       | (b & 0b10) << 2       |
                  (r & 0b1) << 2        | (g & 0b1) << 1        | (b & 0b1);

        context.fillStyle = `rgb(${r}, ${g}, ${b})`;
        context.fillRect(x, y, 1, 1);
      }
    }
  }
  output.textContent = '';
}
main();