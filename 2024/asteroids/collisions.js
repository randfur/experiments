import {Engine} from './engine.js';
import {remove} from './utils.js';

export class Collisions {
  colliders = [];

  constructor() {
    ({
      promise: this.check,
      resolve: this.resolveCheck,
    } = Promise.withResolvers());
  }

  register(collider) {
    this.colliders.push(collider);
    collider.unregisterCallbacks.push(() => {
      remove(this.colliders, collider);
    });
    collider.colliding = false;
  }

  async init() {
    while (true) {
      await Engine.nextFrame;

      for (const collider of this.colliders) {
        collider.colliding = false;
      }
      for (let i = 0; i < this.colliders.length; ++i) {
        const collider = this.colliders[i];
        for (let j = i + 1; j < this.colliders.length; ++j) {
          const otherCollider = this.colliders[j];
          const squareDistance = (collider.position.x - otherCollider.position.x) ** 2 + (collider.position.y - otherCollider.position.y) ** 2;
          if (squareDistance < (collider.radius + otherCollider.radius) ** 2) {
            collider.colliding = true;
            otherCollider.colliding = true;
          }
        }
      }

      this.resolveCheck();
      ({
        promise: this.check,
        resolve: this.resolveCheck,
      } = Promise.withResolvers());
    }
  }
}