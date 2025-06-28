import {Game} from 'https://randfur.github.io/async-game-engine/engine/game.js';
import {BasicScene} from 'https://randfur.github.io/async-game-engine/presets/basic-scene.js';
import {BasicEntity} from 'https://randfur.github.io/async-game-engine/presets/basic-entity.js';
import {randomRange} from 'https://randfur.github.io/async-game-engine/utils/random.js';
import {lerp, smooth} from 'https://randfur.github.io/async-game-engine/utils/math.js';

async function main() {
  new Game({
    drawing: {
      clearFrames: false,
      viewScale: 8,
    },
    initialScene: class extends BasicScene {
      async run() {
        this.create(FlowingHeightMap);
        await this.forever();
      }
    },
  });
}

class FlowingHeightMap extends BasicEntity {
  init() {
    this.equation = new EvolvingEquation((vary, x, y) => {
      return 128 * Math.abs(
        Math.cos(
          (x - vary(-10, 100, 10)) / vary(25, 100) +
          Math.sin(((y - vary(-10, 10, 10)) / vary(80, 200) - vary(-1, 1)) * vary(1, 20))) +
        Math.sin(
          (y - vary(-10, 100, 10)) / vary(25, 100) +
          Math.cos(((x - vary(-10, 10, 10)) / vary(80, 200) - vary(-1, 1)) * vary(1, 20)))
      );
    });
    this.image = new ImageData(this.game.width, this.game.height);
    this.image.data.fill(255);
  }
  
  async run() {
    let lastTime = 0;
    while (true) {
      const time = await this.tick();
      this.equation.evolve(time - lastTime);
      lastTime = time;
    }
  }
  
  onDraw(context, width, height) {
    for (let x = 0; x < this.image.width; ++x) {
      for (let y = 0; y < this.image.height; ++y) {
        const height = this.equation.run(x, y);
        this.image.data[(y * this.image.width + x) * 4 + 3] = height;
      }
    }
    context.putImageData(this.image, 0, 0);
  }
}

class EvolvingEquation {
  constructor(equation) {
    this.time = 0;
    this.varyings = [];
    equation((min, max, durationFactor=1) => {
      this.varyings.push({
        startValue: randomRange(min, max),
        endValue: randomRange(min, max),
        startTime: this.time,
        endTime: this.time + this.#getDuration(durationFactor),
      });
      return min;
    });

    this.varyingIndex = 0;
    this.run = equation.bind(null, (min, max, durationFactor=1) => {
      if (this.varyingIndex >= this.varyings.length) {
        this.varyingIndex = 0;
      }
      const varying = this.varyings[this.varyingIndex];
      ++this.varyingIndex;
      
      if (this.time > varying.endTime) {
        varying.startValue = varying.endValue;
        varying.endValue = randomRange(min, max);
        varying.startTime = varying.endTime;
        varying.endTime = this.time + this.#getDuration(durationFactor);
      }
      return lerp(
        varying.startValue,
        varying.endValue,
        smooth((this.time - varying.startTime) / (varying.endTime - varying.startTime)),
      );
    });
  }
  
  evolve(seconds) {
    this.time += seconds;
  }
  
  #getDuration(durationFactor) {
    return randomRange(3, 10) * durationFactor;
  }
}

main();