import {Game} from './engine/game.js';
import {Entity} from './engine/entity.js';
import {TAU, range, random, randomRange, deviate, rotate} from './utils.js';

function main() {
  new Game({
    canvas: document.getElementById('canvas'),
    viewWidth: window.innerWidth,
    viewHeight: window.innerHeight,
    viewScale: 1,
    async run(job, game) {
      const area = {
        width: 400,
        height: 400,
        depth: 400,
      };
      for (let i of range(100)) {
        game.create(Firefly, {
          x: 0,
          y: 0,
          z: area.depth / 2,
          area,
        });
      }
      await job.forever();
    },
  });
}

class Firefly extends Entity {
  async run({x, y, z, area}, game) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.area = area;

    this.dx = deviate(10);
    this.dy = deviate(10);
    this.dz = deviate(10);

    this.do(async job => {
      while (true) {
        this.blink = false;
        await job.sleep(randomRange(1, 4));
        this.blink = true
        await job.sleep(random(0.2));
      }
    });

    const friction = {
      x: 0.25,
      y: 0.5,
      z: 0.25,
    };
    const attraction = {
      x: 0,
      y: 0,
      z: area.depth * 0.5,
      strength: 0.5,
    };
    while (true) {
      const timePassed = Math.min(await this.tick(), 1 / 60);

      const ddx = Math.cos(this.y) * 500 - this.dx * friction.x + (attraction.x - this.x) * attraction.strength;
      const ddy = Math.cos(this.z) * 500 - this.dy * friction.y + (attraction.y - this.y) * attraction.strength;
      const ddz = Math.cos(this.x) * 500 - this.dz * friction.z + (attraction.z - this.z) * attraction.strength;

      this.dx += ddx * timePassed;
      this.dy += ddy * timePassed;
      this.dz += ddz * timePassed;

      this.x += this.dx * timePassed;
      this.y += this.dy * timePassed;
      this.z += this.dz * timePassed;
    }
  }

  onDraw(context, width, height) {
    const rgb = this.blink ? '255, 255, 200' : '200, 200, 0';
    context.fillStyle = `rgb(200, 200, 0)`;
    for (const i of range(10)) {
      this.drawSpark(context, width, height,
          this.x - this.dx * (i / 300),
          this.y - this.dy * (i / 300),
          this.z - this.dz * (i / 300),
          1);
    }

    if (this.blink) {
      context.fillStyle = 'rgb(255, 255, 200)';
    }
    this.drawSpark(context, width, height,
        this.x,
        this.y,
        this.z,
        4);
  }

  drawSpark(context, width, height, x, y, z, size) {
    if (z < 0 || z > this.area.depth) {
      return;
    }
    const zDiv = z / 100;
    const rectSize = size / zDiv;
    context.save();
    context.translate(width / 2 + x / zDiv, height / 2 + y / zDiv);
    context.rotate(TAU / 8);
    context.fillRect(
        -rectSize / 2,
        -rectSize / 2,
        rectSize,
        rectSize);
    context.restore();
  }
}

main();