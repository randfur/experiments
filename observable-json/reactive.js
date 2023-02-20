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
    blue: true,
  });

  (async () => {
    while (true) {
      await sleep(100 + random(300));
      write(model.cow, coinFlip() ? 'moo' : 'tip');
      write(model.blue, coinFlip());
    }
  })();

  return render(document.body, () => {
    return group(
      {
        style: {
          color: () => read(model.blue) ? 'blue' : 'grey',
        },
        textContent: model.cow,
      },
      htmlList(model.dogs, dog => dog.barks),
    );
  });
}

////////////////////////////////////////////////////////////////
// Proxy
////////////////////////////////////////////////////////////////

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
        writeObservers: [],
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
    writeObservers: [],
  }, observableJsonProxyHandler);
}

function isJsonProxy(object) {
  return Boolean(object[jsonProxyInternals]);
}

////////////////////////////////////////////////////////////////
// Proxy access
////////////////////////////////////////////////////////////////

let modelAccessAllowed = true;
let modelMutationAllowed = true;
let htmlBranchObserverStack = [];
let writeObserver = null;

export function read(proxy) {
  console.assert(modelAccessAllowed);
  const internals = proxy[jsonProxyInternals];
  if (writeObserver) {
    internals.writeObservers.push(writeObserver);
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
  console.assert(isJsonProxy(proxy));
  console.assert(modelAccessAllowed);
  console.assert(modelMutationAllowed);
  const internals = proxy[jsonProxyInternals];
  console.log(internals);
  if ('json' in internals) {
    internals.json = value;
  } else {
    const {parent, property} = internals;
    traverseForRead(parent)[property] = value;
  }
  for (const writeObserver of internals.writeObservers) {
    writeObserver();
  }
}

export function mutate(proxy, mutator) {
  console.assert(modelAccessAllowed);
  console.assert(modelMutationAllowed);
  const internals = proxy[jsonProxyInternals];
  mutator(traverseForRead(internals));
  for (const writeObserver of internals.writeObservers) {
    writeObserver();
  }
}

////////////////////////////////////////////////////////////////
// Rendering
////////////////////////////////////////////////////////////////

export function render(container, generateElementTemplate) {
  // TODO:
  // - Crash on any writes.
  // - Look for reads and member accesses.
  // - Register HTML pieces that require re-rendering for reads and member accesses.
  // - Clear registrations when things get re-rendered.
  modelAccessAllowed = false;
  const elementTemplate = generateElementTemplate();
  modelAccessAllowed = true;
  return renderElementTemplate(container, elementTemplate);
}

function renderElementTemplate(container, elementTemplate) {
  const {tag, style, events, children} = popKeys(elementTemplate, {
    tag: 'div',
    style: {},
    events: {},
    children: [],
  });
  console.assert(typeof tag === 'string');
  const element = document.createElement(tag);

  console.assert(typeof style === 'object');
  for (const [property, value] of Object.entries(style)) {
    setTemplateValue(value => {
      if (property.startsWith('-')) {
        element.style.setProperty(property, value);
      } else {
        element.style[property] = value;
      }
    }, value);
  }

  // TODO: events

  for (let [property, value] of Object.entries(elementTemplate)) {
    setTemplateValue(value => {
      element[property] = value
    }, value);
  }

  // TODO: children

  container.append(element);
}

function setTemplateValue(setter, value) {
  if (isJsonProxy(value)) {
    writeObserver = () => {
      setter(read(value));
    };
    writeObserver();
    writeObserver = null;
  } else if (typeof value === 'function') {
    writeObserver = () => {
      setter(value());
    };
    writeObserver();
    writeObserver = null;
  } else {
    setter(value);
  }
}

////////////////////////////////////////////////////////////////
// HTML branches
////////////////////////////////////////////////////////////////

class HtmlList {
  constructor(listModel, generateItemTemplate) {
    this.listModel = listModel;
    this.generateItemTemplate = generateItemTemplate;
  }
}

function htmlList(listModel, generateItemTemplate) {
  return new HtmlList(listModel, generateItemTemplate);
}

////////////////////////////////////////////////////////////////
// HTML helpers
////////////////////////////////////////////////////////////////

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

