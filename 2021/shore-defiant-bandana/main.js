import {canvas, context, width, height} from './engine/canvas.js';
import {Clock} from './engine/clock.js';
import {drawAll} from './engine/utils.js';
import {Sky} from './things/sky.js';
import {Stars} from './things/stars.js';
import {Ground} from './things/ground.js';
import {Buildings} from './things/buildings.js'

const things = [
  Sky,
  Stars,
  Ground,
  Buildings,
];

async function main() {
  for (const thing of things) {
    thing.init?.();
  }

  let lastTime = performance.now();
  while (true) {
    await Clock.advance();
    drawAll(things);
  }
}

main();