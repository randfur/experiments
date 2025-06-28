import {lerp, smooth} from './math.js';
import {range} from './array.js';
import {deviate, randomRange} from './random.js';

const dimensionMoverCount = 2;
export class Vec3Mover {
  constructor(out, origin, deviation, delayMin, delayMax) {
    this.out = out;
    this.movers = range(3 * dimensionMoverCount).map(i => {
      const dimension = i % 3;
      let startValue = 0;
      let targetValue = origin.getIndex(dimension) + deviate(deviation.getIndex(dimension));
      let startTime = 0;
      let delay = 0;
      return {
        update() {
          const time = performance.now();
          if (time > startTime + delay) {
            startValue = targetValue;
            targetValue = origin.getIndex(dimension) + deviate(deviation.getIndex(dimension));
            startTime = time;
            delay = randomRange(delayMin, delayMax);
          }
          const value = lerp(
            startValue,
            targetValue,
            smooth(
              (time - startTime) / delay
            ),
          );
          console.log(value);
          out.setIndex(
            dimension,
            out.getIndex(dimension) + value / dimensionMoverCount,
          );
        }
      };
    });
  }
  
  update() {
    this.out.set(0, 0, 0);
    for (const mover of this.movers) {
      mover.update();
    }
  }
}