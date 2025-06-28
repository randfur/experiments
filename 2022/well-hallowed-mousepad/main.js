import {Game} from 'https://randfur.github.io/async-game-engine/engine/game.js';
import {BasicScene} from 'https://randfur.github.io/async-game-engine/presets/basic-scene.js';
import {ShapeSnake} from './shape-snake.js';

async function main() {
  new Game({
    drawing: {
      clearFrames: false,
      viewScale: 1,
    },
    initialScene: class extends BasicScene {
      async run() {
        this.drawing2dRegistry.register(this, (context, width, height) => {
          context.fillStyle = "#00000008";
          context.fillRect(0, 0, width, height);
        }).zIndex = -1;

        const snakeCount = 3;
        let snakes = [];
        for (let i = 0; i < snakeCount; ++i) {
          snakes.push(this.create(ShapeSnake));
        }

        // while (snakes.length > 0) {
        //   await job.sleep(1);
        //   snakes.pop().stop();
        // }

        await this.forever();
      }
    },
  });
}

main();