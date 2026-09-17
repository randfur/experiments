import {Star} from './star.js';

export class StarEmitter {
  constructor(game, position, count) {
    this.alive = true;
    this.game = game;
    this.position = position;
    this.remaining = emitDuration;
    this.count = count;
    this.size = 5;
  }

  update(time, timeDelta) {
    --this.remaining;
    if (this.remaining <= 0) {
      this.game.entities.push(new Star(this.game, this.position.clone(), this.size));
      this.size += 5;
      --this.count;
      this.remaining = emitDuration;
    }
    this.alive = this.count > 0;
  }

  draw(hexLines, textContext) {
  }
}

const emitDuration = 3;