export function bitmapToCollision(canvas) {
  const width = canvas.width;
  const height = canvas.height;

  const data = canvas.getContext('2d').getImageData(0, 0, width, height).data;
  
  const heightMaps = buildHeightMaps(data, width, height);
  const boundingBox = getBoundingBox(heightMaps);
}

function buildHeightMaps(data, width, height) {
  function isInside(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height;
  }
  
  function isOpaque(x, y) {
    return data[(x + y * width) * 4 + 3] > 0;
  }

  const heightMaps = [
    { startPixelX: 0, startPixelY: -1, endPixelX: width - 1, endPixelY: -1, dx: 0, dy: 1 },
    { startPixelX: width, startPixelY: 0, endPixelX: width, endPixelY: height - 1, dx: -1, dy: 0 },
    { startPixelX: width - 1, startPixelY: height, endPixelX: 0, endPixelY: height, dx: 0, dy: -1 },
    { startPixelX: -1, startPixelY: 0, endPixelX: -1, endPixelY: height - 1, dx: 1, dy: 0 },
  ];
  for (const heightMap of heightMaps) {
    const {startPixelX, startPixelY, endPixelX, endPixelY, dx, dy} = heightMap;
    const length = Math.abs(endPixelX - startPixelX) + Math.abs(endPixelY - startPixelY) + 1;
    heightMap.data = new Int32Array(length);
    heightMap.lowest = {
      minIndex: Infinity,
      maxIndex: -Infinity,
      value: Infinity,
    };
    for (let i = 0; i < length; ++i) {
      const baseX = startPixelX + Math.sign(endPixelX - startPixelX) * i;
      const baseY = startPixelY + Math.sign(endPixelY - startPixelY) * i;
      let height = 0;
      while (true) {
        const x = baseX + (height + 1) * dx;
        const y = baseY + (height + 1) * dy;
        if (!isInside(x, y)) {
          height = Infinity;
          break;
        }
        if (isOpaque(x, y)) {
          break;
        }
        ++height;
      }
      heightMap.data[i] = height;
      if (height < heightMap.lowest.value) {
        heightMap.lowest.value = height;
        heightMap.lowest.minIndex = Math.min(heightMap.lowest.minIndex, i);
        heightMap.lowest.maxIndex = Math.max(heightMap.lowest.maxIndex, i);
      }
    }
  }
  return heightMaps;
}

function getBoundingBox(heightMaps) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const heightMap of heightMaps) {
    heightMap
  }
}

/*
- Find peak points.
- For left and right directions (e.g. right):
  - Find rightmost peak.
  - For each height from right most edge inwards:
    - Create line from peak corner to height corner and save as "best" with end point.
    - If line contains more than previous best:
      - save new line as best.
      - Create new segment from height to last best line endpoint.

What is contains more?
- Has less steep rise over run.
*/

