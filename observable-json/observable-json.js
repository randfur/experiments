const jsonProxyInternals = Symbol();
let modelAccessAllowed = true;
let modelMutationAllowed = true;
const watcherStack = [];

/*
# Public

export Json = null | undefined | number | string | Array<Json> | Record<string, Json>;
export interface ObservableJsonProxy extends Proxy {}
export type ReadingValue = ObservableJsonProxy | Function | any;

export function createObservableJsonProxy(json: Json): ObservableJsonProxy;
export function read(proxy: ObservableJsonProxy): Json;
export function write(proxy: ObservableJsonProxy, value: Json);
export function mutate(proxy: ObservableJsonProxy, mutator: () => void);
export function lockAccessing(f: () => void);
export function lockMutating(f: () => void);
export function watch(readingValue: ReadingValue, consumer: (value: any) => void);
export function printObservation(proxy: ObservableJsonProxy);

# Private

type Internals = InternalsRoot | InternalsPropertyReferenc;

interface InternalsBase {
  subProxies: Set<ObservableJsonProxy>;
  watchers: Set<Watcher>;
  notifyCount: 0;
}

interface InternalsRoot extends InternalsBase {
  json: Json;
}

interface InternalsPropertyReference extends InternalsBase {
  parent: Internals,
  property: string,
}

class Watcher {
  readingValue: ReadingValue;
  consumer: (value: any) => void;
  parentWatcher: Watcher | null;
  subWatchers: Set<Watcher>;
  proxies: Set<ObservableJsonProxy>;
  runCount: number;

  constructor(readingValue: readingValue, consumer: (value: any) => void);
  clear();
  run();
}

function createInternalsBase(): InternalsBase;
function isObservableJsonProxy(value: any): boolean;
function notifyWatchers(internals: Internals);

*/

export function createObservableJsonProxy(json) {
  return new Proxy({
    ...createProxyInternalsBase(),
    json,
  }, observableJsonProxyHandler);
}

function createProxyInternalsBase() {
  return {
    subProxies: {},
    watchers: new Set(),
    notifyCount: 0,
  };
}

const observableJsonProxyHandler = {
  // get(internals: Internals, property: string, proxy: ObservableJsonProxy): ObservableJsonProxy | Internals;
  get(internals, property, proxy) {
    if (property === jsonProxyInternals) {
      return internals;
    }
    if (!(property in internals.subProxies)) {
      internals.subProxies[property] = new Proxy({
        ...createProxyInternalsBase(),
        parent: internals,
        property,
      }, observableJsonProxyHandler);
    }
    return internals.subProxies[property];
  },
  has(internals, property, proxy) {
    console.assert(false);
  },
  set(internals, property, value, proxy) {
    console.assert(false);
  },
};

function isObservableJsonProxy(object) {
  return typeof object === 'object' && Boolean(object[jsonProxyInternals]);
}

export function read(proxy) {
  console.assert(modelAccessAllowed);
  const internals = proxy[jsonProxyInternals];
  if (watcherStack.length > 0) {
    const watcher = watcherStack[watcherStack.length - 1];
    watcher.proxies.add(proxy);
    internals.watchers.add(watcher);
  }
  return extractJsonValue(internals);
}

function extractJsonValue(internals) {
  if ('json' in internals) {
    return internals.json;
  }
  const {parent, property} = internals;
  return extractJsonValue(parent)[property];
}

export function write(proxy, value) {
  console.assert(isObservableJsonProxy(proxy));
  console.assert(modelAccessAllowed);
  console.assert(modelMutationAllowed);
  const internals = proxy[jsonProxyInternals];
  if ('json' in internals) {
    internals.json = value;
  } else {
    const {parent, property} = internals;
    extractJsonValue(parent)[property] = value;
  }
  notifyWatchers(internals);
}

export function mutate(proxy, mutator) {
  console.assert(modelAccessAllowed);
  console.assert(modelMutationAllowed);
  const internals = proxy[jsonProxyInternals];
  mutator(extractJsonValue(internals));
  notifyWatchers(internals);
}

function notifyWatchers(internals) {
  // TODO: Defer to animation frame.
  // TODO: Notify watchers in tree order.

  internals.notifyCount += internals.watchers.size;

  const notifyingWatchers = internals.watchers;
  internals.watchers = new Set();

  lockMutating(() => {
    for (const watcher of notifyingWatchers) {
      watcher.run();
    }
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
    this.parentWatcher = null;
    if (watcherStack.length > 0) {
      this.parentWatcher = watcherStack[watcherStack.length - 1];
      this.parentWatcher.subWatchers.add(this);
    }
    this.subWatchers = new Set();
    this.proxies = new Set();
    this.runCount = 0;
  }

  clear() {
    for (const proxy of this.proxies) {
      proxy[jsonProxyInternals].watchers.delete(this);
    }
    this.proxies.clear();
    for (const subWatcher of this.subWatchers) {
      subWatcher.parentWatcher = null;
      subWatcher.clear();
    }
    this.subWatchers.clear();
  }

  run() {
    ++this.runCount;
    this.clear();
    watcherStack.push(this);

    if (isObservableJsonProxy(this.readingValue)) {
      this.consumer(read(this.readingValue));
    } else {
      console.assert(typeof this.readingValue === 'function');
      this.consumer(this.readingValue());
    }

    watcherStack.pop();
  }
}

export function watch(readingValue, consumer) {
  if (isObservableJsonProxy(readingValue) || typeof readingValue === 'function') {
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
  const watchers = new Set();

  result += `JSON: ${JSON.stringify(internals.json, null, '  ')}\n\n`;

  result += 'PROXY:\n';
  function printProxy(proxy, indent='') {
    let result = indent;
    const internals = proxy[jsonProxyInternals];
    if ('json' in internals) {
      result += '{json}';
    } else {
      result += `[${internals.property}]`;
    }
    result += ` (watchers: ${internals.watchers.size}, notifyCount: ${internals.notifyCount})\n`;
    for (const watcher of internals.watchers) {
      watchers.add(watcher);
    }
    for (const subProxy of Object.values(internals.subProxies)) {
      result += printProxy(subProxy, indent + '  ');
    }
    return result;
  }
  result += printProxy(proxy);
  result += '\n';

  result += 'WATCHERS:\n';
  function printProxyInternalsName(proxyInternals) {
    if ('json' in proxyInternals) {
      return '{json}';
    }
    return `${printProxyInternalsName(proxyInternals.parent)}.${proxyInternals.property}`;
  }
  function printWatcher(watcher, indent='') {
    watchers.delete(watcher);
    let result = indent;
    const proxyNames = Array.from(watcher.proxies).map(proxy => proxy[jsonProxyInternals]).map(printProxyInternalsName);
    result += `[${proxyNames.join(', ')}] (runCount: ${watcher.runCount})\n`;
    for (const subWatcher of watcher.subWatchers) {
      result += printWatcher(subWatcher, indent + '  ');
    }
    return result;
  }
  while (watchers.size > 0) {
    let watcher = watchers.values().next().value;
    while (watcher.parentWatcher) {
      watcher = watcher.parentWatcher;
    }
    result += printWatcher(watcher);
  }
  // TODO: Print the watcher tree.

  return result;
}