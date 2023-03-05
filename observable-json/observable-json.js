/*
# Public

export Json = null | undefined | number | string | Array<Json> | Record<string, Json>;
export interface ObservableJsonProxy extends Proxy {}
export type ReadingValue<T> = ObservableJsonProxy | () => T | T;

export function createObservableJsonProxy(json: Json): ObservableJsonProxy;
export function printObservation(proxy: ObservableJsonProxy);

export function read(proxy: ObservableJsonProxy): Json;
export function write(proxy: ObservableJsonProxy, value: Json);
export function mutate(proxy: ObservableJsonProxy, mutator: () => void);
export function watch<T>(readingValue: ReadingValue<T>, consumer: (value: any) => void);

# Private

type ProxyInternals = ProxyInternalsRoot | ProxyInternalsPropertyReferenc;

interface ProxyInternalsBase {
  subProxies: Set<ObservableJsonProxy>;
  watchers: Set<Watcher>;
  notifyCount: 0;
}

interface ProxyInternalsRoot extends ProxyInternalsBase {
  json: Json;
}

interface ProxyInternalsPropertyReference extends ProxyInternalsBase {
  parent: ProxyInternals,
  property: string,
}

class Watcher<T> {
  readingValue: ReadingValue<T>;
  consumer: (value: T) => void;
  parentWatcher: Watcher<any> | null;
  subWatchers: Set<Watcher<any>>;
  proxies: Set<ObservableJsonProxy>;
  runCount: number;

  constructor(readingValue: ReadingValue<T>, consumer: (value: T) => void);
  clear();
  run();
}

function createProxyInternalsBase(): ProxyInternalsBase;
function isObservableJsonProxy(value: any): boolean;
function notifyWatchers(proxyInternals: ProxyInternals);
*/

const proxyInternalsKey = Symbol();
let proxyMutationAllowed = true;
const watcherStack = [];
let currentNotifyId = 0;
let pendingNotify = false;
const pendingNotifyProxyInternals = new Set();

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
  get(proxyInternals, property, proxy) {
    if (property === proxyInternalsKey) {
      return proxyInternals;
    }
    if (!(property in proxyInternals.subProxies)) {
      proxyInternals.subProxies[property] = new Proxy({
        ...createProxyInternalsBase(),
        parent: proxyInternals,
        property,
      }, observableJsonProxyHandler);
    }
    return proxyInternals.subProxies[property];
  },
  has(proxyInternals, property, proxy) {
    console.assert(false);
  },
  set(proxyInternals, property, value, proxy) {
    console.assert(false);
  },
};

function isObservableJsonProxy(object) {
  return typeof object === 'object' && Boolean(object[proxyInternalsKey]);
}

export function printObservation(proxy) {
  let result = '';
  let proxyInternals = proxy[proxyInternalsKey];
  while (!('json' in proxyInternals)) {
    proxyInternals = proxyInternals.parent;
  }
  const watchers = new Set();

  result += `JSON: ${JSON.stringify(proxyInternals.json, null, '  ')}\n\n`;

  result += 'PROXY:\n';
  function printProxy(proxy, indent='') {
    let result = indent;
    const proxyInternals = proxy[proxyInternalsKey];
    if ('json' in proxyInternals) {
      result += '{json}';
    } else {
      result += `[${proxyInternals.property}]`;
    }
    result += ` (watchers: ${proxyInternals.watchers.size}, notifyCount: ${proxyInternals.notifyCount})\n`;
    for (const watcher of proxyInternals.watchers) {
      watchers.add(watcher);
    }
    for (const subProxy of Object.values(proxyInternals.subProxies)) {
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
    const proxyNames = Array.from(watcher.proxies).map(proxy => proxy[proxyInternalsKey]).map(printProxyInternalsName);
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

  return result;
}

export function read(proxy) {
  const proxyInternals = proxy[proxyInternalsKey];
  if (watcherStack.length > 0) {
    const watcher = watcherStack[watcherStack.length - 1];
    watcher.proxies.add(proxy);
    proxyInternals.watchers.add(watcher);
  }
  return extractJsonValue(proxyInternals);
}

function extractJsonValue(proxyInternals) {
  if ('json' in proxyInternals) {
    return proxyInternals.json;
  }
  const {parent, property} = proxyInternals;
  return extractJsonValue(parent)[property];
}

export function write(proxy, value) {
  console.assert(isObservableJsonProxy(proxy));
  console.assert(proxyMutationAllowed);
  const proxyInternals = proxy[proxyInternalsKey];
  if ('json' in proxyInternals) {
    proxyInternals.json = value;
  } else {
    const {parent, property} = proxyInternals;
    extractJsonValue(parent)[property] = value;
  }
  notifyWatchers(proxyInternals);
}

export function mutate(proxy, mutator) {
  console.assert(proxyMutationAllowed);
  const proxyInternals = proxy[proxyInternalsKey];
  mutator(extractJsonValue(proxyInternals));
  notifyWatchers(proxyInternals);
}

class Watcher {
  constructor(readingValue, consumer) {
    this.lastNotifyId = currentNotifyId;
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
      proxy[proxyInternalsKey].watchers.delete(this);
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
    this.lastNotifyId = currentNotifyId;
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
  const oldProxyMutationAllowed = proxyMutationAllowed;
  proxyMutationAllowed = false;
  if (isObservableJsonProxy(readingValue) || typeof readingValue === 'function') {
    const watcher = new Watcher(readingValue, consumer);
    watcher.run();
  } else {
    consumer(readingValue);
  }
  proxyMutationAllowed = oldProxyMutationAllowed;
}

function notifyWatchers(proxyInternals) {
  if (proxyInternals.watchers.size === 0) {
    return;
  }

  pendingNotifyProxyInternals.add(proxyInternals);

  if (pendingNotify) {
    return;
  }

  pendingNotify = true;
  requestAnimationFrame(() => {
    const oldProxyMutationAllowed = proxyMutationAllowed;
    proxyMutationAllowed = false;
    ++currentNotifyId;

    for (const proxyInternals of pendingNotifyProxyInternals) {
      const watchers = new Set(proxyInternals.watchers);
      while (watchers.size > 0) {
        let watcher = watchers[Symbol.iterator]().next().value;

        // Process parent watchers in set before their descendants.
        let checkWatcher = watcher;
        while (checkWatcher.parent) {
          checkWatcher = checkWatcher.parent;
          if (checkWatcher in watchers) {
            watcher = checkWatcher;
          }
        }

        watchers.delete(watcher);

        if (watcher.lastNotifyId < currentNotifyId && proxyInternals.watchers.has(watcher)) {
          ++proxyInternals.notifyCount;
          watcher.run();
        }
      }
    }
    pendingNotifyProxyInternals.clear();

    proxyMutationAllowed = oldProxyMutationAllowed;
    pendingNotify = false;
  });
}
