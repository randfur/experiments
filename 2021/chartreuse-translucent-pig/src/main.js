const sections = [];

function bisect(initialValue, set, tooHigh) {
  let low = initialValue;
  let high = initialValue;
  if (tooHigh()) {
    while (tooHigh()) {
      low = Math.floor(low / 2);
      set(low);
    }
  } else {
    while (!tooHigh()) {
      high = 2 * Math.max(high, 1);
      set(high);
    }
  }
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    set(mid);
    if (tooHigh()) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return low;
}

function init() {
  const pre = document.createElement('pre');
  document.body.appendChild(pre);
  // bisect(0, x => {
  //   pre.textContent = '0'.repeat(x);
  // }, () => {
  //   const rect = pre.getBoundingClientRect();
  //   return innerWidth < rect.x + rect.width;
  // });
  pre.textContent = '0';
  const boundingBox = document.body.getBoundingClientRect();
  console.log(boundingBox);
}

function main() {
  init();
}
main();