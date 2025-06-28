import {Canvas} from './canvas.js';
import {Grid} from './grid.js';

export let Grids = {
  front: null,
  frontDelay: null,
  back: null,

  setup() {
    Grids.front = new Grid();
    Grids.frontDelay = new Int8Array(Canvas.width * Canvas.height);
    Grids.back = new Grid();
  },

  update() {
    Grids.front.update();
    Grids.back.update();
    
    for (let x = 0; x < Canvas.width; ++x) {
      for (let y = 0; y < Canvas.height; ++y) {
        let delay = Grids.frontDelay[x + y * Canvas.width];
        let aliveSign = Grids.front.isAlive(x, y) ? 1 : -1;
        if (delay == 0) {
          delay = 2 * aliveSign;
        } else {
          if (Math.sign(delay) != aliveSign) {
            delay -= Math.sign(delay);
          }
        }
        Grids.frontDelay[x + y * Canvas.width] = delay;
      }
    }
  },

  render() {
    Canvas.imageData.data.fill(0);
    for (let y = 0; y < Canvas.height; ++y) {
      for (let x = 0; x < Canvas.width; ++x) {
        const pixelIndex = (y * Canvas.width + x) * 4;
        const edgeBump = Grids.front.countAdjacentAlive(x, y) + Grids.back.countAdjacentAlive(x, y) - y % 2 * 8;
        // if (!Grids.front.isAlive(x, y)) {
        if (Grids.frontDelay[x + y * Canvas.width] < 0) {
          const fraction = (y - x / 8 + edgeBump) / Canvas.height;
          const underFraction = Math.min(1, 1 + fraction);
          Canvas.imageData.data.set(
              Grids.back.isAlive(x, y)
                ? [255 * fraction, 0, 255 * underFraction, 255]
                : [255, 255 * fraction, 255 * underFraction, 255],
              pixelIndex);
        } else {
          const fraction = (x > 0 && x < Grids.front.width - 1 && y > 0) * (1 - Grids.front.countAdjacentAlive(x, y) / 8);
          // const fraction = 0;
          Canvas.imageData.data.set(
              [50 * fraction, 0, 255 * fraction, 255],
              pixelIndex);
        }
      }
    }
    Canvas.context.putImageData(Canvas.imageData, 0, 0);
  },
}