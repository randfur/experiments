import {
  sleep,
  random,
  pickRandom,
  coinFlip,
  popKeys,
  sum,
  setElementStyle,
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

  observer = () => {
    console.log(read(model.cow));
  };
  console.log(read(model.cow));
  observer = null;
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
        observers: [],
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

export function createObservableJson(json) {
  return new Proxy({
    json,
    subProxies: {},
    observers: [],
  }, observableJsonProxyHandler);
}

let modelAccessAllowed = true;
let modelMutationAllowed = true;
let observer = null;

export function render(generateElementTemplate) {
  // TODO:
  // - Crash on any writes.
  // - Look for reads and member accesses.
  // - Register HTML pieces that require re-rendering for reads and member accesses.
  // - Clear registrations when things get re-rendered.
  modelAccessAllowed = false;
  const elementTemplate = generateElementTemplate();
  modelAccessAllowed = true;
  return renderElementTemplate(elementTemplate);
}

function renderElementTemplate(elementTemplate) {
  const {tag, style, events, children} = popKeys(params, {
    tag: 'div',
    style: {},
    events: {},
    children: [],
  });
  console.assert(typeof tag === 'string');
  const element = document.createElement(tag);
  if (typeof style === 'function') {
    // TODO: Not sure about observer registration:
    // - How are observers cleaned up when this element goes away?
    // - How to avoid reregistering the same observers a second time when it gets re-run?
    // - How to ensure this observer gets registered on different values if state changes cause different values to be read via future branching?
    observer = () => {
      setElementStyle(element, style());
    };
    observer();
    observer = null;
  } else {
    setElementStyle(element, style);
  }
}

function flexColumn(...children) {
  return ({
    style: {
      display: 'flex',
      flexDirection: 'column',
    },
    children,
  });
}

function group(...children) {
  return { children };
}

export function read(proxy) {
  console.assert(modelAccessAllowed);
  const internals = proxy[jsonProxyInternals];
  if (observer) {
    internals.observers.push(observer);
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

export function write(proxy, value) {
  console.assert(modelAccessAllowed);
  console.assert(modelMutationAllowed);
  const internals = proxy[jsonProxyInternals];
  if ('json' in internals) {
    internals.json = value;
  } else {
    const {parent, property} = internals;
    traverseForRead(parent)[property] = value;
  }
  for (const observer of internals.observers) {
    observer();
  }
}

export function mutate(proxy, mutator) {
  console.assert(modelAccessAllowed);
  console.assert(modelMutationAllowed);
  const internals = proxy[jsonProxyInternals];
  mutator(traverseForRead(internals));
  for (const observer of internals.observers) {
    observer();
  }
}
