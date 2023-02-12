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

  writeListener = () => {
    console.log(read(model.cow));
  };
  console.log(read(model.cow));
  writeListener = null;
  write(model.cow, 'tip');

  // (async () => {
  //   while (true) {
  //     await sleep(1000 + random(3000));
  //     const barks = pickRandom(model.dogs).barks;
  //     write(barks, read(barks) + coinFlip() ? 1 : -1);
  //   }
  // })();

  // return render(() => flexColumn(
  //   group('there are ', () => sum(...mapRead(model.dogs, ({barks}) => read(barks))), ' dog bark'),
  //   () => mapRead(model.dogs, ({barks}) => group('🐶 ', () => 'bark '.repeat(read(barks)))),
  //   group('cow go ', model.cow),
  // ));
}

const jsonProxyInternals = Symbol();
const observableJsonProxyHandler = {
  get(target, property, receiver) {
    if (property === jsonProxyInternals) {
      return target;
    }
    if (!(property in target.subProxies)) {
      target.subProxies[property] = new Proxy({
        parent: target,
        property,
        subProxies: {},
        writeListeners: [],
      }, observableJsonProxyHandler);
    }
    return target.subProxies[property];
  },
  has(target, property, receiver) {
    console.assert(false);
  },
  set(target, property, value, receiver) {
    console.assert(false);
  },
};

function createObservableJson(json) {
  return new Proxy({
    json,
    subProxies: {},
    writeListeners: [],
  }, observableJsonProxyHandler);
}

let modelAccessAllowed = true;
let modelMutationAllowed = true;
let writeListener = null;

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
  const internals = proxy[jsonProxyInternals];
  if (writeListener) {
    internals.writeListeners.push(writeListener);
  }
  return traverseForRead(internals);
}

function traverseForRead(internals) {
  if ('json' in internals) {
    return internals.json;
  }
  const {parent, property} = internals;
  return traverseForRead(parent)[property];
}

function write(proxy, value) {
  console.assert(modelAccessAllowed);
  console.assert(modelMutationAllowed);
  // TODO.
}
