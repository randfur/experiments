import {Camera} from './camera.js';
import {Drawing} from './drawing.js';
import {Ground} from './ground.js';
import {Bomber} from './bomber.js';
import {range} from './utils.js';

async function main() {
  Drawing.init();
  Camera.init();
  let bombers = range(100).map(_ => new Bomber());

  window.addEventListener('keydown', event => {
    const count = Number(event.key) ** 3;
    if (!isNaN(count)) {
      bombers = range(count).map(_ => new Bomber());
    }
  });

  let previousTime = null;
  while (true) {
    const time = await new Promise(requestAnimationFrame);
    const timeDelta = Math.min(previousTime !== null ? time - previousTime : 0, 16);
    previousTime = time;

    Camera.update(timeDelta, time);
    for (const bomber of bombers) {
      bomber.update(timeDelta, time);
    }

    Drawing.hexLines.clear();
    Ground.addLines();
    for (const bomber of bombers) {
      bomber.addLines();
    }
    Drawing.draw();
  }
}

main();
