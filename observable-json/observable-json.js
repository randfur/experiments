const jsonProxyInternals = Symbol();
let modelAccessAllowed = true;
let modelMutationAllowed = true;
const watcherStack = [];
const

export function createObservableJson(json) {
  return new Proxy({
    ...createProxyInternalsBase(),
    json,
  }, observableJsonProxyHandler);
}

function createProxyInternalsBase() {
  return {
    subProxies: {},
    watchers: new Set(),
  };
}

const observableJsonProxyHandler = {
  get(target, property, receiver) {
    if (property === jsonProxyInternals) {
      return target;
    }
    if (!(property in target.subProxies)) {
      target.subProxies[property] = new Proxy({
        ...createProxyInternalsBase(),
        parent: target,
        property,
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

function isJsonProxy(object) {
  return Boolean(object[jsonProxyInternals]);
}

export function read(proxy) {
  console.assert(modelAccessAllowed);
  const internals = proxy[jsonProxyInternals];
  if (watcherStack.length > 0) {
    const watcher = watcherStack[watcherStack.length - 1];
    watcher.proxies.add(proxy);
    internals.watchers.add(watcher);
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
  if ('json' in internals) {
    internals.json = value;
  } else {
    const {parent, property} = internals;
    traverseForRead(parent)[property] = value;
  }
  for (const watcher of internals.watchers) {
    // TODO: Defer to animation frame.
    watcher.run();
  }
}

export function mutate(proxy, mutator) {
  console.assert(modelAccessAllowed);
  console.assert(modelMutationAllowed);
  const internals = proxy[jsonProxyInternals];
  mutator(traverseForRead(internals));
  for (const watcher of internals.watchers) {
    // TODO: Defer to animation frame.
    watcher.run();
  }
}

export function lockAccessing(f) {
  const oldModelAccessAllowed = modelAccessAllowed;
  modelAccessAllowed = false;
  f();
  modelAccessAllowed = oldModelAccessAllowed;
}

export function lockMutating(f) {
  const oldModelMutationAllowed = modelMutationAllowed;
  modelMutationAllowed = false;
  f();
  modelMutationAllowed = oldModelMutationAllowed;
}

class Watcher {
  constructor(readingValue, consumer) {
    this.readingValue = readingValue;
    this.consumer = consumer;
    this.parentWatcher = watcherStack.length > 0 ? watcherStack[watcherStack.length - 1] : null;
    this.subWatchers = new Set();
    this.proxies = new Set();
  }

  remove() {
    if (this.parentWatcher) {
      this.parentWatcher.subWatchers.delete(this);
    }
    for (const proxy of this.proxies) {
      proxy.watchers.delete(this);
    }
    for (const subWatcher of this.subWatchers) {
      subWatcher.remove();
    }
  }

  run() {
    this.remove();

    if (watcherStack.length > 0) {
      watcherStack[watcherStack.length - 1].subWatchers.add(watcher);
    }
    watcherStack.push(watcher);

    if (isJsonProxy(this.readingValue)) {
      consumer(read(this.readingValue));
    } else {
      console.assert(typeof this.readingValue === 'function');
      consumer(this.readingValue());
    }

    watcherStack.pop();
  }
}

export function watch(readingValue, consumer) {
  if (isJsonProxy(readingValue) || typeof this.readingValue === 'function') {
    const watcher = new Watcher(readingValue, consumer);
    watcher.run();
    return;
  }
  consumer(this.readingValue);
}
