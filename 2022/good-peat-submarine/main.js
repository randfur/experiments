import {Context3d} from './context-3d.js';
import {range} from './utils/array.js';
import {Camera} from './camera.js';
import {sleep, nextFrame} from './utils/async.js';
import {random, randomRange} from './utils/random.js';
import {Bezier} from './bezier.js';
import {Vec3} from './utils/vec3.js';

const width = window.innerWidth;
const height = window.innerHeight;

async function main() {
  canvas.width = width;
  canvas.height = height;
  const camera = new Camera();
  const context3d = new Context3d(canvas, camera);
  
  const bezierCount = 12;
  const beziers = range(bezierCount).map(() => null);
  const sliceSpeed = 0.1;
  (async () => {
    while (true) {
      const index = Math.floor(random(bezierCount));
      if (beziers[index]) {
        const bezier = beziers[index];
        while (bezier.tMin < 1) {
          await nextFrame();
          bezier.tMin = Math.min(bezier.tMin + sliceSpeed, 1);
        }
        beziers[index] = null;
      } else {
        const bezier = new Bezier();
        beziers[index] = bezier;
        bezier.tMax = 0;
        while (bezier.tMax < 1) {
          await nextFrame();
          bezier.tMax = Math.min(bezier.tMax + sliceSpeed, 1);
        }
      }
      await sleep(randomRange(1000, 3000));
    }
  })();
  
  while (true) {
    await nextFrame();
    
    camera.angleY += 0.01;
    
    for (let bezier of beziers) {
      bezier?.draw(context3d);
    }
        
    context3d.processQueue();
  }
}

main();