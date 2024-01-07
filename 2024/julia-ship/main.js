import {Render} from './render.js';

class Wanderer {
  constructor() {
    this.prevFrom = [0, 0, 0, 0];
    this.from = [0, 0, 0, 0];
    this.to = [0, 0, 0, 0];
  }

  push(v) {
    this.prevFrom = this.from;
    this.from = this.to;
    this.to = v;
  }

  sample(progress) {

  }
}

function smooth(x) {
  return x <= 0.5 ? x ** 2 * 2 : 1 - ((1 - x) ** 2 * 2);
}

async function main() {
  await Render.init();

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Render.render(
      new Float32Array([
        1 - 2 * Math.sin(time / 18000), 2, -3 + 8 * Math.cos(time / 8200), 4,
        -8, -2 + 3 * Math.cos(time / 7350), 7, 4 - 6 * Math.sin(time / 21000),
        -0.1, -0.3 + 0.5 * Math.sin(time / 12000), -1.2 + 0.1 * Math.cos(time / 23100), -0.35,
      ]),
    );
  }
}

main();