import {Canvas} from './canvas.js';
import {Config} from './config.js';
import {randBool} from './utils.js';

export class Grid {
  constructor() {
    this.width = Canvas.width;
    this.height = Canvas.height + Config.extraGridHeight;

    this.alive = new Uint8Array(this.width * this.height);
    for (let i = 0; i < this.width * this.height; ++i) {
      this.alive[i] = randBool();
    }

    this.aliveCount = new Uint8Array(this.alive.length);
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        if (this.isAlive(x, y)) {
          this.updateAdjacentCounts(x, y, 1);
        }
      }
    }

    this.aliveCountSnapshot = new Uint8Array(this.aliveCount.length);
  }

  update() {
    for (let x = 0; x < this.width; ++x) {
      this.setAlive(x, this.height - 1, randBool());
    }

    for (let repeat = 0; repeat < 2; ++repeat) {
      for (let i = 0; i < this.aliveCount.length; ++i) {
        this.aliveCountSnapshot[i] = this.aliveCount[i];
      }
      for (let y = 0; y < this.height; ++y) {
        for (let x = 0; x < this.width; ++x) {
          const aliveCount = this.aliveCountSnapshot[y * this.width + x];
          this.setAlive(
              x,
              y,
              this.isAlive(x, y)
                ? aliveCount == 2
                : (
                    aliveCount == 0 ||
                    aliveCount == 1 ||
                    aliveCount == 4 ||
                    aliveCount == 7
                )
          );
        }
      }
    }
  }
  
  inBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  isAlive(x, y) {
    return this.alive[y * this.width + x];
  }

  setAlive(x, y, alive) {
    this.updateAdjacentCounts(x, y, alive - this.isAlive(x, y));
    this.alive[y * this.width + x] = alive;
  }

  countAdjacentAlive(x, y) {
    return this.aliveCount[y * this.width + x];
  }

  updateAdjacentCounts(cellX, cellY, delta) {
    if (delta === 0) {
      return;
    }
    for (let y = cellY - 1; y <= cellY + 1; ++y) {
      for (let x = cellX - 1; x <= cellX + 1; ++x) {
        if ((x == cellX && y === cellY) || !this.inBounds(x, y)) {
          continue;
        }
        this.aliveCount[y * this.width + x] += delta;
      }
    }
  }
};