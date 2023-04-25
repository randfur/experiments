import {Drawing} from './drawing.js';
import {Ground} from './ground.js';

const TAU = Math.PI * 2;

async function main() {
  Drawing.init();
  const camera = Drawing.camera;

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    camera.position.setYPolar(time / 1000, 400, -120);
    camera.rotateYAngle = -time / 1000 - TAU / 8;

    Drawing.clear();
    Ground.addLines();
    Drawing.draw();
  }
}

main();