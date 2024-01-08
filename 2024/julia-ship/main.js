import {Render} from './render.js';
import {TrigWalk} from './trig-walk.js';
import {SmoothRandomWalk} from './smooth-random-walk.js';

async function main() {
  let debug = false;
  window.addEventListener('keypress', event => {
    if (event.key === 'd') {
      debug ^= true;
    }
  });

  await Render.init();

  const walk = SmoothRandomWalk;
  // const walk = TrigWalk;
  walk.init?.();

  while (true) {
    const time = await new Promise(requestAnimationFrame);

    walk.update(time);

    Render.render(walk.uniformData);

    Render.debugContext.clearRect(0, 0, innerWidth, innerHeight);
    if (debug) {
      walk.debugRender?.(Render.debugContext);
    }
  }
}

main();