import {Drawing} from './drawing.js';
import {Ground} from './ground.js';

const TAU = Math.PI * 2;

async function main() {
  Drawing.init();
  const camera = Drawing.camera;

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    const angle = TAU * 0.85 - time / 10000;
    camera.position.setYPolar(angle, 400, -120);
    camera.rotateYAngle = -angle - TAU * 0.25;

    Drawing.clear();
    Ground.addLines();
    Drawing.draw();
  }
}

main();