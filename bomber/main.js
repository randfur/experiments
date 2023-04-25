import {Drawing} from './drawing.js';
import {Ground} from './ground.js';

async function main() {
  Drawing.init();
  const camera = Drawing.camera;

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    camera.position.setPolar(time / 1000, 10, -100);
    camera.position.addXyz(0, -50, 0);

    Drawing.clear();
    Ground.addLines();
    Drawing.draw();
  }
}

main();