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
    dogs: [
      { barks: 1 },
      { barks: 2 },
      { barks: 3 },
    ],
    cow: 'moo',
  });

  (async () => {
    while (true) {
      await sleep(1000 + random(3000));
      const barks = pickRandom(model.dogs).barks;
      write(barks, read(barks) + coinFlip() ? 1 : -1);
    }
  })();

  return render(() => flexColumn(
    group('there are ', () => sum(...mapRead(model.dogs, ({barks}) => read(barks))), ' dog bark'),
    () => mapRead(model.dogs, ({barks}) => group('🐶 ', () => 'bark '.repeat(read(barks)))),
    group('cow go ', model.cow),
  ));
}

let modelAccessAllowed = true;
function render(generateTemplate) {
  // TODO:
  // - Crash on any writes.
  // - Look for reads and member accesses.
  // - Register HTML pieces that require re-rendering for reads and member accesses.
  // - Clear registrations when things get re-rendered.
  modelAccessAllowed = false;
  const template = generateTemplate();
  modelAccessAllowed = true;
  // return renderTemplate(template);?
}

function read(proxy) {
  console.assert(modelAccessAllowed);
  // TODO.
}

function write(proxy, value) {
  console.assert(modelAccessAllowed);
  // TODO.
}