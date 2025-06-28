const TAU = Math.PI * 2;

const traversed = [];

function* solve(start, end, backwards) {
  const lookup = {};
  let recursions = 0;
  function* recurse(curr, depth) {
    yield [...curr, depth];
    ++recursions;
    if (backwards) {
      if (curr[0] < start[0] || curr[1] < start[1])
        return Infinity;
      if (curr[0] == start[0] && curr[1] == start[1])
        return 0;
    } else {
      if (curr[0] > end[0] || curr[1] > end[1])
        return Infinity;
      if (curr[0] == end[0] && curr[1] == end[1])
        return 0;
    }
    let result = lookup[curr];
    if (result === undefined) {
      const leftStep = backwards ? [curr[0] - curr[1], curr[1]] : [curr[0] + curr[1], curr[1]];
      const rightStep = backwards ? [curr[0], curr[1] - curr[0]] : [curr[0], curr[1] + curr[0]];
      let left, right;
      for (const subResult of recurse(leftStep, depth + 1)) {
        if (subResult instanceof Array) {
          yield subResult;
        } else {
          left = subResult;
          break;
        }
      }
      for (const subResult of recurse(rightStep, depth + 1)) {
        if (subResult instanceof Array) {
          yield subResult;
        } else {
          right = subResult;
          break;
        }
      }
      result = 1 + Math.min(left, right);
      lookup[curr] = result;
    }
    return result;
  }
  for (const result of recurse(backwards ? end : start, 0)) {
    if (result instanceof Array)
      yield result;
  }
}

const width = innerWidth;
const height = innerHeight;
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');
const dotsPerFrame = 1000;
const hueStart = Math.random() * 1000;
async function main() {
  let dotsDrawn = 0;
  for (const [x, y, depth] of solve([1, 1], [width, height], false)) {
    context.fillStyle = `hsl(${hueStart - depth}, 100%, 50%)`;
    context.beginPath();
    context.arc(x, y, 1 + depth / 100, 0, TAU);
    context.fill();
    ++dotsDrawn;
    if (dotsDrawn >= dotsPerFrame) {
      await new Promise(requestAnimationFrame);
      dotsDrawn = 0;
    }
  }
}
main();