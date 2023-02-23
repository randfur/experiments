const jsonProxyInternals = Symbol();
let modelAccessAllowed = true;
let modelMutationAllowed = true;
const watcherStack = [];
let notifyingWatchers = null;
let notifyingWatchersWaitingRoom = new Set();

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
  return typeof object === 'object' && Boolean(object[jsonProxyInternals]);
}

export function read(proxy) {
  console.assert(modelAccessAllowed);
  const internals = proxy[jsonProxyInternals];
  if (watcherStack.length > 0) {
    const watcher = watcherStack[watcherStack.length - 1];
    watcher.proxies.add(proxy);
    if (internals.watchers === notifyingWatchers) {
      // We are currently iterating over internals.watchers in notifyWatchers,
      // if we add the watcher to it during its run() it will get re-run() again
      // in an infinite loop. Add to notifyingWatchersWaitingRoom instead.
      notifyingWatchersWaitingRoom.add(watcher);
    } else {
      internals.watchers.add(watcher);
    }
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
  notifyWatchers(internals);
}

export function mutate(proxy, mutator) {
  console.assert(modelAccessAllowed);
  console.assert(modelMutationAllowed);
  const internals = proxy[jsonProxyInternals];
  mutator(traverseForRead(internals));
  notifyWatchers(internals);
}

function notifyWatchers(internals) {
  console.assert(notifyingWatchers === null);
  console.assert(notifyingWatchersWaitingRoom.size === 0);
  // TODO: Defer to animation frame.
  // TODO: Notify highest level watcher.
  lockMutating(() => {
    // Indicate globally that internals.watchers is being notified and not to
    // add to it. If existing watchers are added to it during their run() they
    // will be iterated over again and have run() called again in an infinite
    // loop. Add to notifyingWatchersWaitingRoom instead and we'll swap them in
    // when iteration is done.
    notifyingWatchers = internals.watchers;
    for (const watcher of internals.watchers) {
      watcher.run();
    }
    [notifyingWatchersWaitingRoom, internals.watchers] = [internals.watchers, notifyingWatchersWaitingRoom];
    notifyingWatchersWaitingRoom.clear();
    notifyingWatchers = null;
  });
}

export function lockAccessing(f) {
  const oldModelAccessAllowed = modelAccessAllowed;
  modelAccessAllowed = false;
  const result = f();
  modelAccessAllowed = oldModelAccessAllowed;
  return result;
}

export function lockMutating(f) {
  const oldModelMutationAllowed = modelMutationAllowed;
  modelMutationAllowed = false;
  const result = f();
  modelMutationAllowed = oldModelMutationAllowed;
  return result;
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
      proxy[jsonProxyInternals].watchers.delete(this);
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
    watcherStack.push(this);

    if (isJsonProxy(this.readingValue)) {
      this.consumer(read(this.readingValue));
    } else {
      console.assert(typeof this.readingValue === 'function');
      this.consumer(this.readingValue());
    }

    watcherStack.pop();
  }
}

export function watch(readingValue, consumer) {
  if (isJsonProxy(readingValue) || typeof readingValue === 'function') {
    const watcher = new Watcher(readingValue, consumer);
    watcher.run();
    return;
  }
  consumer(readingValue);
}

export function printObservation(proxy) {
  let result = '';
  let internals = proxy[jsonProxyInternals];
  while (!('json' in internals)) {
    internals = internals.parent;
  }
  result += `JSON: ${JSON.stringify(internals.json, null, '  ')}\n`;

  result += 'PROXY:\n';
  function printProxy(proxy, indent='') {
    let result = indent;
    const internals = proxy[jsonProxyInternals];
    if ('json' in internals) {
      result += '{JSON}';
    } else {
      result += `[${internals.property}]`;
    }
    result += ` (watchers: ${internals.watchers.size})\n`;
    for (const subProxy of Object.values(internals.subProxies)) {
      result += printProxy(subProxy, indent + '  ');
    }
    return result;
  }
  result += printProxy(proxy);
  return result;
}