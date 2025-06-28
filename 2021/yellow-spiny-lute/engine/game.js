import {removeItems} from '../utils.js';
import {Job, jobStoppedSignal} from './job.js';
import {Drawing} from './drawing.js';

export class Game {
  #nextId;
  #jobs;
  #resolveTick;
  #resolveStopped;
  
  constructor({canvas, width, height, run}) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    this.#nextId = 0;
    this.#jobs = [];
    this.#setupTick();
    this.stoppedPromise = new Promise(resolve => this.#resolveStopped = resolve);
    this.stopped = false;
    
    this.drawing = new Drawing(this, true);

    this.do(run, null);
    
    (async () => {
      while (!this.stopped && this.#jobs.length > 0) {
        removeItems(this.#jobs, job => job.isStopped());
        const time = await new Promise(requestAnimationFrame);
        this.#resolveTick(time);
        this.#setupTick();
      }
      this.stopped = true;
      this.#resolveStopped();
    })();
  }
  
  do(run, parentJob) {
    const job = new Job(this, this.#useNextId(), parentJob);
    this.#add(job, () => run(job, this));
    return job;
  }
  
  create(entityType, args, parentJob) {
    const entity = new entityType(this, this.#useNextId(), parentJob);
    this.#add(entity, () => entity.run(args, this));
    return entity;
  }
  
  stop() {
    this.stopped = true;
  }
  
  #setupTick() {
    this.nextTickPromise = new Promise(resolve => {
      this.#resolveTick = resolve;
    });
  }
  
  #useNextId() {
    return this.#nextId++;
  }

  #add(job, run) {
    this.#jobs.push(job);
    (async () => {
      try {
        await run();
      } catch (error) {
        if (error !== jobStoppedSignal) {
          throw error;
        }
      } finally {
        job.stop();
        job.cleanUp();
      }
    })();
  }
}