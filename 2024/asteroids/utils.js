export function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function once(f) {
  let run = false;
  return function(...args) {
    if (!run) {
      f.call(this, ...args);
      run = true;
    }
  };
}

export function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

export function repeat(n, f) {
  for (let i = 0; i < n; ++i) {
    f();
  }
}

export function remove(array, item) {
  const index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

export const deathSignal = Symbol('deathSignal');

export async function discardDeathSignal(promise) {
  try {
    await promise;
  } catch (error) {
    if (error !== deathSignal) {
      throw error;
    }
  }
}

