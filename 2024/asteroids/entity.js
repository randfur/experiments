import {Engine} from './engine.js';
import {deathSignal} from './utils.js';

export class Entity {
  alive = true;
  whenDead;
  signalDeath;
  unregisterCallbacks = [];

  constructor() {
    ({
      promise: this.whenDead,
      reject: this.signalDeath,
    } = Promise.withResolvers());
  }

  async run() {}

  die() {
    if (this.alive) {
      this.alive = false;
      this.signalDeath(deathSignal);
      this.cleanUp();
    }
  }

  cleanUp() {
    for (const unregisterCallback of this.unregisterCallbacks) {
      unregisterCallback();
    }
  }

  async raceDeath(promise) {
    return Promise.race([promise, this.whenDead]);
  }

  async processDuration(duration, f) {
    const start = Engine.time;
    while (true) {
      await this.raceDeath(Engine.nextFrame);
      f(Math.min(1, (Engine.time - start) / duration));
      if (Engine.time >= start + duration) {
        break;
      }
    }
  }
}
