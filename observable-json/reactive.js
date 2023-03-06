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

  render(app, [
    'Dogs',
    htmlMap(model.dogs, dog => [
      read`Dog ${dog.name} is ${dog.size} big.`,
      htmlMap(dog.legs, leg => leg),
    ]),
  ]);
}
