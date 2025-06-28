import {Context3d} from './context-3d.js';
import {range} from './utils/array.js';
import {Camera} from './camera.js';
import {sleep, nextFrame} from './utils/async.js';
import {random, randomRange, deviate} from './utils/random.js';
import {lerp} from './utils/math.js';
import {Bezier, queryBezier} from './bezier.js';
import {Vec3Mover} from './utils/vec3-mover.js';
import {Vec3} from './utils/vec3.js';

const width = window.innerWidth;
const height = window.innerHeight;

async function main() {
  canvas.width = width;
  canvas.height = height;
  const camera = new Camera();
  const context3d = new Context3d(canvas, camera);
  
  let beziers = [];
  
  let disableUpdating = false;
  const swishSpeed = 0.1;
  const swishStart = 0.2;
  let lastUpdate = 0;
  async function updateBeziers() {
    if (disableUpdating) {
      return;
    }
    disableUpdating = true;
    lastUpdate = performance.now();
    
    if (beziers.length > 0) {
      const lastBezier = beziers[beziers.length - 1];
      while (lastBezier.tMin < 1) {
        await nextFrame();
        for (const bezier of beziers) {
          bezier.tMin = Math.min(bezier.tMin + swishSpeed, 1);
          if (bezier.tMin < swishStart) {
            break;
          }
        }
      }
    }

    await sleep(200);
    
    beziers = createBeziers();
    disableUpdating = false;
    for (const bezier of beziers) {
      bezier.tMax = 0;
    }
    const lastBezier = beziers[beziers.length - 1];
    while (lastBezier.tMax < 1) {
      await nextFrame();
      for (const bezier of beziers) {
        bezier.tMax = Math.min(bezier.tMax + swishSpeed, 1);
        if (bezier.tMax < swishStart) {
          break;
        }
      }
    }
  }
  updateBeziers();
  window.addEventListener('click', updateBeziers);
  window.addEventListener('keypress', updateBeziers);
  const minDelay = 5000;
  (async () => {
    while (true) {
      await sleep(randomRange(20000, 40000));
      if (performance.now() - lastUpdate > minDelay) {
        updateBeziers();
      }
    }
  })();
  
  while (true) {
    await new Promise(requestAnimationFrame);
    
    camera.angleY -= 0.005;
    
    for (let bezier of beziers) {
      bezier.draw(context3d);
    }
        
    context3d.processQueue();
  }
}

function createBeziers() {
  const beziers = [];
  
  function createPoint(offset=null) {
    const point = new Vec3(
      deviate(200),
      deviate(200),
      deviate(200),
    );
    if (offset) {
      point.add(offset);
    }
    return point;
  }
  
  function createBezierData(startOffset, endOffset) {
    const offset = new Vec3();
    return range(4).map(i => {
      offset.lerpBetween(startOffset, endOffset, i / 3);
      return createPoint(offset);
    });
  }
  
  function queryBezierData(data, t, out) {
    queryBezier(data[0], data[1], data[2], data[3], t, out);
  }
  
  const startOffset = createPoint();
  const endOffset = new Vec3();
  endOffset.scale(-1);
  const bezierDataA = createBezierData(startOffset, endOffset);
  const bezierDataB = createBezierData(startOffset, endOffset);
  const bezierDataC = createBezierData(startOffset, endOffset);
  const bezierDataD = createBezierData(startOffset, endOffset);
  
  const average = new Vec3();
  average.add(bezierDataA[0]);
  average.add(bezierDataA[3]);
  average.add(bezierDataD[0]);
  average.add(bezierDataD[3]);
  average.scale(1 / 4);
  
  for (const bezierData of [bezierDataA, bezierDataB, bezierDataC, bezierDataD]) {
    for (const point of bezierData) {
      point.subtract(average);
    }
  }
  
  const huePair = [random(360), random(360)];
  const lightnessPair = [randomRange(40, 80), randomRange(40, 80)];
  
  const count = 40;
  for (let i = 0; i < count; ++i) {
    const t = i / (count - 1);
    const bezier = new Bezier();
    bezier.colour = `hsl(${lerp(huePair[0], huePair[1], t)}deg, 100%, ${lerp(lightnessPair[0], lightnessPair[1], t)}%)`;
    queryBezierData(bezierDataA, t, bezier.a);
    queryBezierData(bezierDataB, t, bezier.b);
    queryBezierData(bezierDataC, t, bezier.c);
    queryBezierData(bezierDataD, t, bezier.d);
    beziers.push(bezier);
  }
  
  return beziers;
}

main();