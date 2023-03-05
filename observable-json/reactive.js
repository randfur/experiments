import {
  sleep,
  random,
  coinFlip,
} from './utils.js';
import {
  createObservableJsonProxy,
  write,
  read,
  printObservation,
} from './observable-json.js';
import {
  render,
} from './render.js';

export function reactiveExample() {
  let model = createObservableJsonProxy({
    mode: 'dog',
    dog: {
      emoji: '🐶',
      value: 30,
    },
    cow: {
      emoji: '🐄',
      value: 0,
    },
  });

  setInterval(() => {
    write(model.mode, coinFlip() ? 'dog' : 'cow');
  }, 3100);

  setInterval(() => {
    write(model.dog.value, 20 + random(20));
  }, 700);

  setInterval(() => {
    write(model.cow.value, random(100));
  }, 600);

  setInterval(() => {
    debug.textContent = printObservation(model);
  }, 100);

  render(app, {
    style: () => {
      const mode = read(model.mode);
      const valueProxy = model[mode].value;
      const result = {
        height: '40px',
      };
      if (mode === 'dog') {
        result.fontSize = () => `${read(valueProxy)}px`;
      } else {
        result.fontSize = '20px';
        result.marginLeft = () => `${read(valueProxy)}px`;
      }
      return result;
    },
    textContent: () => read(model[read(model.mode)].emoji),
  });
}
