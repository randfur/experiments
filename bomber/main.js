import {Drawing} from './drawing.js';

async function main() {
  Drawing.init();


  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Drawing.clear();

    const line = Drawing.addLine();
    line.start.set(50 + 50 * Math.sin(6 + time / 110), 200 + 100 * Math.sin(time / 130), 1);
    line.end.set(570 + 100 * Math.sin(5 + time / 100), 100 + 110 * Math.sin(3 + time / 300), 1);
    line.width = 4;
    line.colour = 'blue';

    Drawing.draw();
  }
}

main();