import {Entity} from './engine/entity.js';
import {TAU, rotate} from './utils.js';

export class Spark extends Entity {
  async run({dx, dy, dz, shift}, game) {
    this.x = 0;
    this.y = 0;
    this.z = 200;
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;

    const friction = 3;
    const sinStrength = 3000;
    const sinFrequency = 0.03;
    const timeScale = 0.4;
    
    const attraction = {
      x: 0,
      y: 0,
      z: 100,
      strength: 3,
    };

    while (true) {
      const timeDelta = Math.min(await this.tick(), 0.1) * timeScale;

      this.dx += timeDelta * Math.sin(shift * 1 * TAU + (this.y + this.dz) * sinFrequency) * sinStrength;
      this.dy += timeDelta * Math.sin(shift * 2 * TAU + (this.z + this.dx) * sinFrequency) * sinStrength;
      this.dz += timeDelta * Math.sin(shift * 3 * TAU + (this.x + this.dy) * sinFrequency) * sinStrength;

      this.dx += timeDelta * -this.dx * friction;
      this.dy += timeDelta * -this.dy * friction;
      this.dz += timeDelta * -this.dz * friction;
      
      this.dx += timeDelta * (attraction.x - this.x) * attraction.strength;
      this.dy += timeDelta * (attraction.y - this.y) * attraction.strength;
      this.dz += timeDelta * (attraction.z - this.z) * attraction.strength;

      this.x += timeDelta * this.dx;
      this.y += timeDelta * this.dy;
      this.z += timeDelta * this.dz;
      
      this.drawHandle.zIndex = this.z;
    }
  }
  
  onDraw(context) {
    if (this.z <= 0) {
      return;
    }
    const zDiv = this.z / 400;
    const x = this.game.width / 2 + this.x / zDiv;
    const y = this.game.height / 2 + this.y / zDiv;
    const size = 10 / zDiv;
    context.translate(x, y);
    context.rotate(TAU / 8);
    context.fillStyle = '#f804';
    context.fillRect(-size / 2, -size / 2, size, size);
    context.fillStyle = '#ff8';
    context.fillRect(-size / 4, -size / 4, size / 2, size / 2);
    context.resetTransform();
  }
}