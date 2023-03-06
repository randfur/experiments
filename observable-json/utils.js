export function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function random(x) {
  return Math.random() * x;
}

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function coinFlip() {
  return Math.random() > 0.5;
}

export function popKeys(object, keyDefaults) {
  const result = {};
  for (const [key, defaultValue] of Object.entries(keyDefaults)) {
    result[key] = key in object ? object[key] : defaultValue;
    delete object[key];
  }
  return result;
}

export function sum(...values) {
  let result = 0;
  for (let value of values) {
    result += value;
  }
  return result;
}

export function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}
