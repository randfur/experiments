import {Engine} from './engine.js';
import {deathSignal, discardDeathSignal} from './utils.js';

export class Entity {
  alive = true;
  lifetime;
  signalDeath;
  unregisterCallbacks = [];

  constructor() {
    ({
      promise: this.lifetime,
      reject: this.signalDeath,
    } = Promise.withResolvers());
  }

  async run() {}

  destroy() {
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

  whileAlive(f) {
    return discardDeathSignal(f());
  }

  lifetimeScoped(promise) {
    return Promise.race([promise, this.lifetime]);
  }

  async processDuration(duration, f) {
    const start = Engine.time;
    while (true) {
      await this.lifetimeScoped(Engine.nextFrame);
      f(Math.min(1, (Engine.time - start) / duration));
      if (Engine.time >= start + duration) {
        break;
      }
    }
  }
}
