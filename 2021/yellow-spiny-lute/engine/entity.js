import {Job} from './job.js';

export class Entity extends Job {
  async run() {
    throw new Error('Entity run() method not implemented.');
  }
}