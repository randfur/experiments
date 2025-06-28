import {Game} from './engine/game.js';
import {Entity} from './engine/entity.js';
import {TAU, random, deviate} from './utils.js';
import {Spark} from './spark.js';

function main() {
  new Game({
    canvas: document.getElementById('canvas'),
    width: window.innerWidth,
    height: window.innerHeight,
    async run(job, game) {
      for (let i = 0; i < 100; ++i) {
        job.create(Spark, {
          dx: deviate(1),
          dy: deviate(1),
          dz: deviate(1),
          shift: random(1),
        });
      }
      
      await job.forever();
    },
  });
}

main();