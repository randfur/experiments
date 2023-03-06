import {
  sleep,
  random,
  coinFlip,
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
  let model = createObservableJsonProxy({
    dogs: [],
  });

  setInterval(() => {
    mutate(model.dogs, dogs => {
      dogs.push({
        name: 'woof' + Math.floor(random(100)),
        size: Math.ceil(random(100)),
      });
    });
  }, 1000);

  render(app, {
    textContent: 'Dogs',
    children: htmlMap(model.dogs, dog => {
      return {
        textContent: () => `Dog ${read(dog.name)} is ${read(dog.size)} big.`,
      };
    }),
  });
}
