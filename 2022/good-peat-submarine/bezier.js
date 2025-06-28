import {Vec3} from '../utils/vec3.js';
import {Line} from '../shapes/line.js';
import {random, randomRange, deviate} from '../utils/random.js';

export function queryBezier(a, b, c, d, t, out) {
  const e = Vec3.pool.acquire();
  const f = Vec3.pool.acquire();
  const g = Vec3.pool.acquire();
  e.lerpBetween(a, b, t);
  f.lerpBetween(b, c, t);
  g.lerpBetween(c, d, t);

  const h = Vec3.pool.acquire();
  const i = Vec3.pool.acquire();
  h.lerpBetween(e, f, t);
  i.lerpBetween(f, g, t);

  out.lerpBetween(h, i, t);

  Vec3.pool.release(5);
}

export class Bezier {
  constructor() {
    this.a = createPoint();
    this.b = createPoint();
    this.c = createPoint();
    this.d = createPoint();
    this.colour = `hsl(${random(360)}deg, 100%, ${randomRange(25, 75)}%)`;
    this.tMin = 0;
    this.tMax = 1;
  }
  

  getPosition(t, out) {
    return queryBezier(this.a, this.b, this.c, this.d, t, out);
  }
  
  draw(context3d, tStart=this.tMin, tEnd=this.tMax, startPosition=null, endPosition=null) {
    let releaseStartPosition = false;
    let releaseEndPosition = false;
    if (!startPosition) {
      releaseStartPosition = true;
      startPosition = Vec3.pool.acquire();
      this.getPosition(tStart, startPosition);
    }
    if (!endPosition) {
      releaseEndPosition = true;
      endPosition = Vec3.pool.acquire();
      this.getPosition(tEnd, endPosition);
    }

    if (startPosition.squareDistanceTo(endPosition) < 5 ** 2) {
      const line = context3d.add(Line);
      line.start.copy(startPosition);
      line.end.copy(endPosition);
      line.colour = this.colour;
      line.addOnePixel = true;
    } else {
      const tMid = (tStart + tEnd) / 2;
      const midPosition = Vec3.pool.acquire();
      this.getPosition(tMid, midPosition);
      this.draw(context3d, tStart, tMid, startPosition, midPosition);
      this.draw(context3d, tMid, tEnd, midPosition, endPosition);
      Vec3.pool.release(1);
    }

    if (releaseStartPosition) {
      Vec3.pool.release(1);
    }
    if (releaseEndPosition) {
      Vec3.pool.release(1);
    }
  }
}

function createPoint() {
  return new Vec3(
    deviate(200),
    deviate(200),
    deviate(200),
  );
}
