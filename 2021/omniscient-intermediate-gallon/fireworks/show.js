import {Entity} from '../engine/entity.js';
import {FireworkFlare} from './firework-flare.js';
import {Sprinkler} from './sprinkler.js';
import {randomRange, choose} from '../utils.js';

export class Show extends Entity {
  async run() {
    this.game.drawing.context.globalCompositeOperation = 'lighter';
    while (true) {
      await this.sleep(randomRange(0.25, 1));
      this.create(choose([
        FireworkFlare,
        Sprinkler,
      ]));
    }
    // Pattern ideas:
    //   Spawn fireworks every n seconds.
    //   Sometimes hold off for a bit and do a flood.
    //   Meta patterns.
    //     Inject events every n spots.
    //     Repeat common stuff n times in a row.
    //     Reverse patterns.
    //     Schedule patterns with parameters incrementing.
  }
}