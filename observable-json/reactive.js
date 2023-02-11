import {
  sleep,
  random,
  pickRandom,
  coinFlip,
  popKeys,
  sum,
} from './utils.js';

export function reactiveExample() {
  let model = createObservableJson({
    dog: [
      { barks: 1 },
      { barks: 2 },
      { barks: 3 },
    ],
    cow: 'moo',
  });

  (async () => {
    while (true) {
      await sleep(1000 + random(3000));
      const barks = pickRandom(model.dog).barks;
      write(barks, read(barks) + coinFlip() ? 1 : -1);
    }
  })();

  return render(() => flexColumn(
    group('there are ', () => sum(...model.dog.map(({barks}) => read(barks))), ' dog bark'),
    map(model.dog, ({barks}) => group('🐶 ', () => 'bark '.repeat(read(barks)))),
    group('cow go ', model.cow),
  ));
}

let writeAllowed = true;
function render(generateTemplate) {
  // TODO:
  // - Crash on any writes.
  // - Look for reads and member accesses.
  // - Register HTML pieces that require re-rendering for reads and member accesses.
  // - Clear registrations when things get re-rendered.
  writeAllowed = false;
  const template = generateTemplate();
  writeAllowed = true;


}

function read(proxy) {
  // TODO.
}

function write(proxy, value) {
  console.assert(writeAllowed);
  // TODO.
}