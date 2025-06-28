import {Game} from './engine/game.js';
import {Job} from './engine/job.js';
import {TAU, range, random, randomRange, deviate, rotate} from './utils.js';

function main() {
  new Game({
    container: document.body,
    viewWidth: window.innerWidth,
    viewHeight: window.innerHeight,
    viewScale: 2,
    async run(job, game) {
      for (const i of range(100)) {
        job.create(Pants, {
          x: random(game.width),
          y: random(game.height),
          dx: deviate(1),
          dy: deviate(1),
          angle: random(TAU),
        });
      }
      await job.forever();
    },
  });
}

class Pants extends Job {
  async run(args, game) {
    Object.assign(this, args);
    this.width = 4;
    this.height = 4;
    this.collisions = 0;
    
    game.drawing.register(this, context => this.onDraw(context));

    while (true) {
      this.x += this.dx;
      this.y += this.dy;

      if (this.x < 0) { this.x += game.width; }
      if (this.x > game.width) { this.x -= game.width; }
      if (this.y < 0) { this.y += game.height; }
      if (this.y > game.height) { this.y -= game.height; }
      
      await this.tick();
    }
  }
  
  onCollide(other, otherCollider) {
    ++this.collisions;
  }
  
  onDraw(context) {
    const colour = `hsl(${this.collisions % 360}deg, 100%, 50%)`;
    context.fillStyle = colour;
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}


main();