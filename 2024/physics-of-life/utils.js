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

export function makeGrid({cellSize, width, height}) {
  let result = [];
  for (let y = 0; y < height; ++y) {
    const row = [];
    for (let x = 0; x < width; ++x) {
      row.push(null);
    }
    result.push(row);
  }
  return result;
}
