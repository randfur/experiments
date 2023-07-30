import {Camera} from './camera.js';
import {Drawing} from './drawing.js';
import {Ground} from './ground.js';
import {Bomber} from './bomber.js';

async function main() {
  Drawing.init();
  Bomber.init();
  Camera.init();

  let previousTime = null;
  while (true) {
    const time = await new Promise(requestAnimationFrame);
    const timeDelta = previousTime !== null ? time - previousTime : 0;
    previousTime = time;

    Camera.update(timeDelta, time);
    Bomber.update(timeDelta, time);

    Drawing.clear();
    Ground.addLines();
    Bomber.addLines();
    Drawing.draw();
  }
}

main();