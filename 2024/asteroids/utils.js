export function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function once(f) {
  let run = false;
  return function() {
    if (!run) {
      f.call(this);
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
