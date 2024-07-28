import {Animation} from './animation.js';

export class AnimationPack {
  static root = Symbol();

  constructor() {
    this.animationMap = new Map();
    this.animationMap.set(AnimationPack.root, new Animation(AnimationPack.root));
  }
}