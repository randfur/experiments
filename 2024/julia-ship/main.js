import {Render} from './render.js';
import {TrigWalk} from './trig-walk.js';
import {SmoothRandomWalk} from './smooth-random-walk.js';

async function main() {
  await Render.init();

  const walk = SmoothRandomWalk;
  // const walk = TrigWalk;
  walk.init?.();

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    walk.update(time);
    Render.render(walk.uniformData);
  }
}

main();