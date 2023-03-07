import {
  sleep,
  random,
  coinFlip,
  range,
} from './utils.js';
import {
  createObservableJsonProxy,
  read,
  write,
  mutate,
  printObservation,
} from './observable-json.js';
import {
  render,
  htmlMap,
} from './render.js';

export function reactiveExample() {
  render(document.getElementById('dogcow'), dogcow());
  render(document.getElementById('dogs'), dogs());
}

function dogcow() {
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

  return {
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
  };
}

function dogs() {
  let model = createObservableJsonProxy({
    dogs: [],
  });

  setInterval(() => {
    mutate(model.dogs, dogs => {
      dogs.push({
        name: 'woof' + Math.floor(random(100)),
        size: Math.ceil(random(100)),
        legs: range(4).map(() => 'leg'),
      });
    });
  }, 1000);

  return [
    'Dogs',
    htmlMap(model.dogs, dog => [
      read`Dog ${dog.name} is ${dog.size} big.`,
      htmlMap(dog.legs, leg => leg),
    ]),
  ];
}
