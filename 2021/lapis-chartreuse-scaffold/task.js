class StopSignal extends Error {}

export class Task {
  #isSelfStopped;
  #isOuterStopped;
  #cleanUps;
  
  static spawn(run, args, isOuterStopped=null) {
    const task = new Task(isOuterStopped);
    task.done = (async () => {
      try {
        await run(task, args);
      } catch (error) {
        if (!(error instanceof StopSignal)) {
          throw error;
        }
      } finally {
        task.stop();
        for (const cleanUp of task.#cleanUps) {
          cleanUp();
        }
      }
    })();
    return task;
  }
  
  constructor(isOuterStopped) {
    this.#isSelfStopped = false;
    this.#isOuterStopped = isOuterStopped;
    this.#cleanUps = [];
  }
  
  #isStopped() {
    return this.#isSelfStopped || this.#isOuterStopped?.();
  }
  
  stop() {
    this.#isSelfStopped = true;
  }
  
  register(cleanUp) {
    this.#cleanUps.push(cleanUp);
  }
  
  async sleep(seconds=0) {
    const start = performance.now();
    while (true) {
      if (this.#isStopped()) {
        throw new StopSignal();
      }
      await new Promise(requestAnimationFrame);
      if (performance.now() - start > seconds * 1000) {
        return;
      }
    }
  }
  
  nextFrame() {
    return this.sleep();
  }
  
  forever() {
    return this.sleep(Infinity);
  }
  
  spawn(run, args) {
    return Task.spawn(run, args, () => this.#isStopped());
  }
}
