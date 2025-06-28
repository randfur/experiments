export const jobDoneSignal = Symbol('jobDoneSignal');

export class Job {
  #resolveDone;

  constructor(game, parentJob) {
    this.game = game;
    this.parentJob = parentJob;
    this.isSelfDone = false;
    this.cleanUps = [];
    this.done = new Promise(resolve => this.#resolveDone = resolve);
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
  
  isDone() {
    return this.isSelfDone || this.parentJob?.isDone?.();
  }
  
  stop() {
    this.isSelfDone = true;
  }
  
  async sleep(duration) {
    const start = duration === 0 ? null : performance.now();
    while (!this.game.stopped) {
      if (this.isDone()) {
        throw jobDoneSignal;
      }
      await this.game.nextTick;
      if (duration === 0) {
        break;
      }
      if ((performance.now() - start) / 1000 >= duration) {
        break;
      }
    }
  }
  
  tick() {
    return this.sleep(0);
  }
  
  forever() {
    return this.sleep(Infinity);
  }
  
  cleanUp() {
    for (const cleanUp of this.cleanUps) {
      cleanUp();
    }
    this.cleanUps.length = 0;
    this.#resolveDone();
  }
}