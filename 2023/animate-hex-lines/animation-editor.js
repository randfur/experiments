import {AnimationPack} from './animation-pack.js';

export AnimationEditor {
  constructor(animationPack) {
    this.animationPack = animationPack;
    this.cursor = {
      id: AnimationPack.root,
      layer: null,
      keyframe: null,
      element: null,
      recursor: null,
    };
  }
}