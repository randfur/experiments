import {Game} from './engine/game.js';
import {Entity} from './engine/entity.js';
import {TAU, random, deviate} from './utils.js';
import {Show} from './fireworks/show.js';

function main() {
  new Game({
    canvas: document.getElementById('canvas'),
    viewWidth: window.innerWidth,
    viewHeight: window.innerHeight,
    viewScale: 4,
    async run(job, game) {
      await job.create(Show).complete;
    },
  });
}

main();