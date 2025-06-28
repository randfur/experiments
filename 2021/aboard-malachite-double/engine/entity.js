import {Job} from './job.js';

export class Entity extends Job {
  constructor(game, id, parentJob) {
    super(game, id, parentJob);
    this.drawHandle = game.drawing.register(this, context => this.onDraw(context));
  }

  async run() {
    throw new Error('Entity run() method not implemented.');
  }
  
  onDraw(context) {}
}