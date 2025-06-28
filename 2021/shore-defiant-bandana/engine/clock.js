const timers = new Set();

export class Clock {
  static time = 0;
  static async advance() {
    const newTime = await new Promise(requestAnimationFrame) / 1000;
    const delta = newTime - Clock.time;
    Clock.time = newTime;
    
    for (const timer of timers) {
      if (Clock.time > timer.endTime) {
        timer.resolve();
        timers.delete(timer);
      }
    }
    
    return delta;
  }
}

export function sleep(seconds = 0) {
  let resolve = null;
  const promise = new Promise(r => {
    resolve = r;
  });
  timers.add({
    endTime: Clock.time + seconds,
    resolve,
  });
  return promise;
}

export async function animateTo({initial, target, setValue, duration}) {
  const startTime = Clock.time;
  while (Clock.time < startTime + duration) {
    setValue(initial + (target - initial) * (Clock.time - startTime) / duration);
    await sleep();
  }
  setValue(target);
}