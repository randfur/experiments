import {Job} from './job.js';

export class Entity extends Job {
  constructor(game, id, parentJob) {
    super(game, id, parentJob);
    game.drawing.register(this, (context, width, height) => this.onDraw(context, width, height));
  }

  async run() {
    throw new Error('Entity run() method not implemented.');
  }
  
  onDraw(context) {}
}