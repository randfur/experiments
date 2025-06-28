const kAlpha = 3;

export function drawDot(imageData, x, y) {
  if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
    return;
  }
  const index = 4 * (y * imageData.width + x);
  imageData.data[index + kAlpha] = 255;
}

export function drawSquare(imageData, midX, midY, size, outline) {
  const startX = midX - Math.floor(size / 2);
  const startY = midY - Math.floor(size / 2);
  for (let i = 0; i < size; ++i) {
    if (outline) {
      drawDot(imageData, startX + i, startY);
      drawDot(imageData, startX + size - 1, startY + i);
      drawDot(imageData, startX + i, startY + size - 1);
      drawDot(imageData, startX, startY + i);
    } else {
      for (let j = 0; j < size; ++j) {
        drawDot(imageData, startX + i, startY + j);
      }
    }
  }
}

export function drawLine(imageData, x1, y1, x2, y2, size) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dx) > Math.abs(dy)) {
    const dir = Math.sign(dx);
    for (let x = x1; x != x2 + dir; x += dir) {
      const y = Math.round(y1 + dy * (x - x1) / dx);
      drawSquare(imageData, x, y, size, x != x1);
    }
  } else {
    const dir = Math.sign(dy);
    for (let y = y1; y != y2 + dir; y += dir) {
      const x = Math.round(x1 + dx * (y - y1) / dy);
      drawSquare(imageData, x, y, size, y != y1);
    }
  }
}