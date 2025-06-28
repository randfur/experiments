import {Game} from './engine/game.js';
import {Entity} from './engine/entity.js';
import {TAU, range, random, randomRange, rotate} from './utils.js';

function main() {
  new Game({
    canvas: document.getElementById('canvas'),
    width: window.innerWidth,
    height: window.innerHeight,
    async run(job, game) {
      const x = random(game.width);
      const y = random(game.height);

      for (const i of range(100)) {
        job.create(Spark, {
          x, y,
          angle: random(TAU),
          friction: 1 / 20,
        });
      }

      await job.forever();
    },
  });
}

class Spark extends Entity {
  async run({x, y, angle, friction}, game) {
    game.drawing.register(this, context => {
      context.fillStyle = 'orange';
      context.fillRect(x, y + 3, 7, 1);
      context.fillRect(x + 3, y, 1, 7);
      context.fillStyle = 'white';
      context.fillRect(x + 2, y + 2, 3, 3);
    });
    
    let dx = 0;
    let dy = 0;
    while (true) {
      [x, y] = rotate(x, y, angle);
      dx += Math.sin(y) - dx * friction;
      dy += Math.sin(x) - dy * friction;
      x += dx;
      y += dy;
      [x, y] = rotate(x, y, -angle);
      if (x < 0) { x += game.width; }
      if (x > game.width) { x -= game.width; }
      if (y < 0) { y += game.height; }
      if (y > game.height) { y -= game.height; }
      await this.tick();
    }
  }
}

main();