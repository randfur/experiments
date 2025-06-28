import {removeItems} from '../utils.js';
import {Job, jobDoneSignal} from './job.js';
import {Drawing} from './drawing.js';
import {Collision} from './collision.js';

export class Game {
  #jobs;
  #resolveTick;
  #resolveDone;
  
  constructor({container, viewScale=1, run}) {
    this.#jobs = [];
    this.nextTick = new Promise(resolve => this.#resolveTick = resolve);
    this.isDone = false;
    this.done = new Promise(resolve => this.#resolveDone = resolve);
    
    this.drawing = new Drawing({game: this, container, viewScale, clearFrames: true});
    
    this.collision = new Collision({game: this, branchingFactor: 10});

    this.do(run, null);
    
    (async () => {
      while (!this.isDone && this.#jobs.length > 0) {
        removeItems(this.#jobs, job => job.isDone());
        const time = await new Promise(requestAnimationFrame);
        this.#resolveTick(time);
        this.nextTick = new Promise(resolve => this.#resolveTick = resolve);
      }
      this.isDone = true;
      this.#resolveDone();
    })();
  }
  
  do(run, parentJob) {
    const job = new Job(this, parentJob);
    this.#add(job, () => run(job, this));
    return job;
  }
  
  create(entityType, args, parentJob) {
    const entity = new entityType(this, parentJob);
    this.#add(entity, () => entity.run(args, this));
    return entity;
  }
  
  stop() {
    this.isDone = true;
  }
  
  get width() { return this.drawing.width; }
  get height() { return this.drawing.height; }

  #add(job, run) {
    this.#jobs.push(job);
    (async () => {
      try {
        await run();
      } catch (error) {
        if (error !== jobDoneSignal) {
          throw error;
        }
      } finally {
        job.stop();
        job.cleanUp();
      }
    })();
  }
}