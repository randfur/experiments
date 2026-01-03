import {Animation} from './animation.js';
import {sampleAnimationData} from './sample-animation-data.js';
import {HexLines2d} from '../../third-party/hex-lines/src/2d/hex-lines-2d.js';

async function main() {
  const {hexLines2d, width, height} = HexLines2d.setupFullPageCanvas();
  const animation = new Animation(hexLines2d, sampleAnimationData);
  const startTime = performance.now();
  while (true) {
    const currentTime = await new Promise(requestAnimationFrame);
    animation.draw((currentTime - startTime) / 1000);
  }
}

main();