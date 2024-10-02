import {Engine} from './engine.js';

export class Entity {
  alive = true;
  whenDead;
  signalDeath;

  constructor() {
    ({
      promise: this.whenDead,
      reject: this.signalDeath,
    } = Promise.withResolvers());
  }

  destroy() {
    this.alive = false;
    this.signalDeath(Engine.deathSignal);
  }

  async deathCheck(promise) {
    return Promise.race([promise, this.whenDead]);
  }
}
