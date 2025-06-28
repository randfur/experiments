import {context, width, height} from '../engine/canvas.js';
import {sleep} from '../engine/clock.js';

function dither(x) {
  return Math.floor(x + devicePixelRatio * (2 * Math.random() - 1));
}

function gradient(progress) {
  return [
    30 * Math.sin(progress * 2),
    1,
    125 * Math.sin(progress),
  ];
}

export class Sky {
  static canvas = new OffscreenCanvas(width, height);
  static context = Sky.canvas.getContext('2d');
  
  static init() {
    for (let y = 0; y < height; ++y) {
      const [r, g, b] = gradient(y / height);
      Sky.context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      Sky.context.fillRect(0, y, width, 1);
    }
    (async () => {
      const imageData = Sky.context.getImageData(0, 0, width, height);
      let lastRefresh = performance.now();
      for (let y = 0; y < height; ++y) {
        const [r, g, b] = gradient(y / height);
        for (let x = 0; x < width; ++x) {
          imageData.data.set([
            dither(r),
            dither(1),
            dither(b),
            255,
          ], (y * width + x) * 4);
        }
        if (performance.now() - lastRefresh > 20) {
          await sleep(0);
          lastRefresh = performance.now();
          Sky.context.putImageData(imageData, 0, 0);
        }
      }
    })();
  }

  static draw() {
    context.drawImage(Sky.canvas, 0, 0);
  }
}