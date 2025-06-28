import {removeItems} from '../utils.js';
import {Job, jobDoneSignal} from './job.js';
import {Drawing} from './drawing.js';

export class Game {
  #nextId;
  #jobs;
  #resolveTick;
  #resolveDone;
  
  constructor({canvas, viewWidth, viewHeight, viewScale=1, run}) {
    this.#nextId = 0;
    this.#jobs = [];
    this.nextTick = new Promise(resolve => this.#resolveTick = resolve);
    this.isDone = false;
    this.done = new Promise(resolve => this.#resolveDone = resolve);
    this.time = 0;
    
    this.width = Math.floor(viewWidth / viewScale);
    this.height = Math.floor(viewHeight / viewScale);
    this.drawing = new Drawing({game: this, canvas, viewScale, clearFrames: true});

    this.do(run, null);
    
    (async () => {
      while (!this.isDone && this.#jobs.length > 0) {
        removeItems(this.#jobs, job => job.isDone());
        const newTime = (await new Promise(requestAnimationFrame)) / 1000;
        const timePassed = newTime - this.time;
        this.time = newTime;
        this.#resolveTick(timePassed);
        this.nextTick = new Promise(resolve => this.#resolveTick = resolve);
      }
      this.isDone = true;
      this.#resolveDone();
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
    this.isDone = true;
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