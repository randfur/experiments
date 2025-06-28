import {Entity} from '../engine/entity.js';
import {TAU, range, random, randomRange, deviate} from '../utils.js';

export class FireworkFlare extends Entity {
  async run(_, game) {
    this.x = game.width / 2;
    this.y = game.height;
    this.dx = deviate(200);
    this.dy = randomRange(-300, -400);
    
    this.do(async job => {
      const gravity = 400;
      while (true) {
        const timeDelta = await job.tick();
        
        this.dy += timeDelta * gravity;
        
        this.x += timeDelta * this.dx;
        this.y += timeDelta * this.dy;
      }
    })
    
    await this.sleep(-this.dy / 400);

    const count = randomRange(100, 200);
    const maxSpeed = randomRange(100, 400);
    for (let i = 0; i < count; ++i) {
      const angle = random(TAU);
      const speed = random(maxSpeed);
      const r = Math.floor(random(16));
      const g = Math.floor(random(16));
      const b = 
      game.create(FireworkSpark, {
        x: this.x,
        y: this.y,
        dx: this.dx / 2 + Math.cos(angle) * speed,
        dy: this.dy / 2 + Math.sin(angle) * speed,
      });
    }
  }
  
  onDraw(context) {
    context.fillStyle = 'white';
    context.fillRect(this.x, this.y, 4, 4);
  }
}

class FireworkSpark extends Entity {
  async run({x, y, dx, dy}, game) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    
    this.do(async job => {
      await job.sleep(randomRange(0.5, 1));
      this.stop();
    });

    const gravity = 500;
    let friction = 0;
    
    while (true) {
      const timeDelta = await this.tick();
      
      this.dy += timeDelta * gravity;
      
      friction += timeDelta * 10;
      this.dx -= timeDelta * this.dx * friction;
      this.dy -= timeDelta * this.dy * friction;
      
      this.x += timeDelta * this.dx;
      this.y += timeDelta * this.dy;
    }
  }
  
  onDraw(context) {
    context.fillStyle = '#fa8';
    context.fillRect(this.x, this.y, 2, 2);
  }
}