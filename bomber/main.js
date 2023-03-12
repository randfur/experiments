import {Drawing} from './drawing.js';

async function main() {
  Drawing.init();
  const camera = Drawing.camera;

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Drawing.clear();

    for (let i = 0; i < 50; ++i) {
      const progress = i / 50;
      const x = 300 * (progress - 0.5);
      const y = 0;
      const z = time / 10 + -100 + 200 * progress
      const top = Drawing.addLine();
      top.start.setXyz(x, y-50, z - 50);
      top.end.setXyz(x, y-50, z + 50);
      top.width = 1;
      top.colour = 'blue';
      const bottom = Drawing.addLine();
      bottom.start.setXyz(-x, y+50, z - 50);
      bottom.end.setXyz(-x, y+50, z + 50);
      bottom.width = 1;
      bottom.colour = 'blue';
    }
    // const line = Drawing.addLine();
    // line.start.setXyz(-10, -10, 10);
    // line.end.setXyz(10, 10, 10);
    // line.width = 1;
    // line.colour = 'white';

    Drawing.draw();
  }
}

main();