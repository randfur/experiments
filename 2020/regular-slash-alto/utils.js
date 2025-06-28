export function clearDebugPrint() {
  output.textContent = '';
}

let now = null;
export function currentTime() {
  if (now === null) {
    now = performance.now();
    (async _ => {
      let prevTime = now;
      while (true) {
        const nextTime = await nextFrame();
        now += Math.min(nextTime - prevTime, 20);
        prevTime = nextTime;
      }
    })();
  }
  return now;
}

export function debugPrint(text) {
  output.textContent += text + '\n';
}

export function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

export function onClick(eventHandler) {
  window.addEventListener('pointerdown', eventHandler);
  function spaceHandler(event) {
    if (event.code == 'Space') {
      eventHandler();
    }
  }
  window.addEventListener('keydown', spaceHandler);
  return {
    remove() {
      window.removeEventListener('pointerdown', eventHandler);
      window.removeEventListener('keydown', spaceHandler);
    },
  };
}

export async function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

export function random(x) {
  return Math.random() * x;
}

export function randomColour() {
  return [
    1 - Math.random() * Math.random(),
    Math.random(),
    Math.random() * Math.random(),
  ].sort(_ => Math.random() - 0.5);
}

export async function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function smooth(progress) {
  return progress < 0.5 ? (2 * progress ** 2) : (1 - 2 * (1 - progress) ** 2);
}

export function timeProgress(start, duration) {
  if (start === null) {
    return 0;
  }
  return Math.min(currentTime() - start, duration) / duration;
} 
