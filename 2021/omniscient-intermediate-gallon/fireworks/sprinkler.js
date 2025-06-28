
import {Job} from '../engine/job.js';
import {Entity} from '../engine/entity.js';
import {TAU, range, random, randomRange, deviate} from '../utils.js';

export class Sprinkler extends Job {
  async run(_, game) {
    const x = random(game.width);
    const y = game.height;
    const angle = -TAU / 4 + deviate(TAU / 8);
    const maxSpeed = randomRange(500, 800);
    const colour = `hsl(${random(360)}deg, 100%, 50%)`;
    
    this.do(async job => {
      await job.sleep(randomRange(2, 5));
      this.stop();
    });
    
    while (true) {
      await this.tick();
      for (let i = 0; i < 4; ++i) {
        game.create(SparklerSpark, {
          x,
          y,
          angle: angle + deviate(0.1),
          speed: random(maxSpeed),
          colour,
        });
      }
    }
  }
}

class SparklerSpark extends Entity {
  async run({x, y, angle, speed, colour}) {
    this.x = x;
    this.y = y;
    this.dx = Math.cos(angle) * speed;
    this.dy = Math.sin(angle) * speed;
    this.colour = colour;

    this.do(async job => {
      await job.sleep(randomRange(0.5, 1));
      this.stop();
    });
    
    const gravity = 500;
    const friction = 2;

    while (true) {
      const timeDelta = await this.tick();

      this.dy += timeDelta * gravity;
      
      this.dx -= timeDelta * this.dx * friction;
      this.dy -= timeDelta * this.dy * friction;
      
      this.x += timeDelta * this.dx;
      this.y += timeDelta * this.dy;
    }
  }
  
  onDraw(context) {
    context.fillStyle = this.colour;
    context.fillRect(this.x, this.y, 1, 1);
  }
}