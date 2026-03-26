async function main() {
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  canvas.width = 1000;
  canvas.height = 1000;
  const context = canvas.getContext('2d');
  const blockSize = 10;

  function setPixel(x, y) {
    context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  }

  function drawLine(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : (x0 == x1) ? 0 : -1;
    const sy = (y0 < y1) ? 1 : (y0 == y1) ? 0 : -1;
    var acc = Math.min(dx, dy);
    var x = x0;
    var y = y0;
    if (dx > dy) {
      while (true) {
        setPixel(x, y);
        if (x === x1) {
          break;
        }
        x += sx;
        acc += dy;
        if (acc >= dx) {
          acc -= dx;
          y += sy;
        }
      }
    } else {
      while (true) {
        setPixel(x, y);
        if (y === y1) {
          break;
        }
        y += sy;
        acc += dx;
        if (acc >= dy) {
          acc -= dy;
          x += sx;
        }
      }
    }
  }

  const middle = 50;
  let x = middle;
  let y = middle;
  window.addEventListener('mousemove', event => {
    x = Math.floor(event.offsetX / blockSize);
    y = Math.floor(event.offsetY / blockSize);
  });
  while (true) {
    await new Promise(requestAnimationFrame);
    context.fillStyle = '#fff1';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    drawLine(middle, middle, x, y);
  }
}

main();