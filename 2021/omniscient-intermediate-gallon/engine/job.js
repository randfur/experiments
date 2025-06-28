export const jobStoppedSignal = Symbol('jobStoppedSignal');

export class Job {
  #resolveComplete;

  constructor(game, id, parentJob) {
    this.game = game;
    this.id = id;
    this.parentJob = parentJob;
    this.stopped = false;
    this.cleanUps = [];
    this.complete = new Promise(resolve => this.#resolveComplete = resolve);
  }
  
  addCleanUp(cleanUp) {
    this.cleanUps.push(cleanUp);
  }
  
  do(run) {
    return this.game.do(run, this);
  }
  
  create(entityType, args) {
    return this.game.create(entityType, args, this);
  }
  
  isStopped() {
    return this.stopped || this.parentJob?.isStopped?.();
  }
  
  stop() {
    this.stopped = true;
  }
  
  async sleep(duration) {
    const start = this.game.time ?? 0;
    while (!this.game.stopped) {
      if (this.isStopped()) {
        throw jobStoppedSignal;
      }
      const timeDelta = await this.game.nextTickPromise;
      if (duration === 0) {
        return timeDelta;
      }
      if (duration === Infinity) {
        continue;
      }
      const elapsed = this.game.time - start;
      if (elapsed >= duration) {
        return elapsed;
      }
    }
  }
  
  tick() {
    return this.sleep(0);
  }
  
  forever() {
    return this.sleep(Infinity);
  }
  
  allComplete(jobs) {
    return Promise.all(jobs.map(job => job.complete));
  }
  
  cleanUp() {
    for (const cleanUp of this.cleanUps) {
      cleanUp();
    }
    this.#resolveComplete();
  }
}