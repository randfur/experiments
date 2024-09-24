import {Engine} from './engine.js';

export class Entity {
  constructor() {
    this.alive = true;
    ({
      promise: this.whenDead,
      reject: this.signalDeath,
    } = Promise.withResolvers());
  }

  destroy() {
    this.alive = false;
    this.signalDeath(Engine.deathSignal);
  }

  deathCheck(promise) {
    return Promise.race([promise, this.whenDead]);
  }
}
