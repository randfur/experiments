export function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function nextFrame() {
  return new Promise(requestAnimationFrame);
}