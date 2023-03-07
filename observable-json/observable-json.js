/*
# Public

export Json = null | undefined | number | string | Array<Json> | Record<string, Json>;
export interface ObservableJsonProxy extends Proxy {}
export type ReadingValue<T> = ObservableJsonProxy | () => T | T;

export function createObservableJsonProxy(json: Json): ObservableJsonProxy;
export function isObservableJsonProxy(value: any): boolean;
export function printObservation(proxy: ObservableJsonProxy);

export function read(proxy: ObservableJsonProxy): Json;
export function write(proxy: ObservableJsonProxy, value: Json);
export function mutate(proxy: ObservableJsonProxy, mutator: () => void);
export function watch<T>(readingValue: ReadingValue<T>, consumer: (value: any) => void);
*/

export function createObservableJsonProxy(json) {
  return new Proxy(unused, new ProxyInternal({json}));
}

export function isObservableJsonProxy(object) {
  return typeof object === 'object' && Boolean(object[internalKey]);
}

export function printObservation(proxy) {
  let result = '';
  let proxyInternal = proxy[internalKey];
  while (!proxyInternal.isRoot()) {
    proxyInternal = proxyInternal.parentProxyInternal;
  }
  const watchers = new Set();

  result += `JSON: ${JSON.stringify(proxyInternal.json, null, '  ')}\n\n`;

  result += 'PROXY:\n';
  function printProxy(proxy, indent='') {
    let result = indent;
    const proxyInternal = proxy[internalKey];
    if (proxyInternal.isRoot()) {
      result += '{json}';
    } else {
      result += `[${proxyInternal.property}]`;
    }
    result += ` (watchers: ${proxyInternal.watchers.size}, notifyCount: ${proxyInternal.notifyCount})\n`;
    for (const watcher of proxyInternal.watchers) {
      watchers.add(watcher);
    }
    for (const subProxy of Object.values(proxyInternal.subProxies)) {
      result += printProxy(subProxy, indent + '  ');
    }
    return result;
  }
  result += printProxy(proxy);
  result += '\n';

  result += 'WATCHERS:\n';
  function printProxyInternalName(proxyInternal) {
    if (proxyInternal.isRoot()) {
      return '{json}';
    }
    return `${printProxyInternalName(proxyInternal.parentProxyInternal)}.${proxyInternal.property}`;
  }
  function printWatcher(watcher, indent='') {
    watchers.delete(watcher);
    let result = indent;
    const proxyNames = Array.from(watcher.proxyInternals).map(printProxyInternalName);
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
  const proxyInternal = proxy[internalKey];
  if (watcherStack.length > 0) {
    const watcher = watcherStack[watcherStack.length - 1];
    watcher.proxyInternals.add(proxyInternal);
    proxyInternal.watchers.add(watcher);
  }
  return proxyInternal.readJsonValue();
}

export function write(proxy, value) {
  console.assert(isObservableJsonProxy(proxy));
  console.assert(proxyMutationAllowed);
  const proxyInternal = proxy[internalKey];
  proxyInternal.writeJsonValue(value);
  proxyInternal.notifyWatchers();
}

export function mutate(proxy, mutator) {
  console.assert(proxyMutationAllowed);
  const proxyInternal = proxy[internalKey];
  mutator(proxyInternal.readJsonValue());
  proxyInternal.notifyWatchers();
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

/*
# Private

class ProxyInternal {
  json: Json;
  parentProxyInternal: ProxyInternal;
  property: string;
  subProxies: Set<ObservableJsonProxy>;
  watchers: Set<Watcher>;
  notifyCount: 0;

  get(unused: Object, property: string, proxy: Proxy);
  has(unused: Object, property: string, proxy: Proxy);
  set(unused: Object, property: string, value: any, proxy: Proxy);

  readJsonValue(): Json;
  writeJsonValue(json: Json);

  notifyWatchers();
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
*/

const internalKey = Symbol();
let proxyMutationAllowed = true;
const watcherStack = [];
let currentNotifyId = 0;
let pendingNotify = false;
const pendingNotifyProxyInternals = new Set();
const unused = {};

class ProxyInternal {
  constructor({json=null, parentProxyInternal=null, property=null}) {
    this.json = json;
    this.parentProxyInternal = parentProxyInternal;
    this.property = property;
    this.subProxies = {};
    this.watchers = new Set();
    this.notifyCount = 0;
  }

  isRoot() {
    return this.json !== null;
  }

  get(unused, property, proxy) {
    if (property === internalKey) {
      return this;
    }
    if (!(property in this.subProxies)) {
      this.subProxies[property] = new Proxy(
        unused,
        new ProxyInternal({
          parentProxyInternal: this,
          property,
        }));
    }
    return this.subProxies[property];
  }

  has(unused, property, proxy) {
    console.assert(false);
  }

  set(unused, property, value, proxy) {
    console.assert(false);
  }

  readJsonValue() {
    if (this.isRoot()) {
      return this.json;
    }
    return this.parentProxyInternal.readJsonValue()[this.property];
  }

  writeJsonValue(json) {
    if (this.isRoot()) {
      this.json = json;
    }
    this.parentProxyInternal.readJsonValue()[this.property] = json;
  }

  notifyWatchers() {
    if (this.watchers.size === 0) {
      return;
    }

    pendingNotifyProxyInternals.add(this);

    if (pendingNotify) {
      return;
    }

    pendingNotify = true;
    requestAnimationFrame(() => {
      const oldProxyMutationAllowed = proxyMutationAllowed;
      proxyMutationAllowed = false;
      ++currentNotifyId;

      for (const proxyInternal of pendingNotifyProxyInternals) {
        const watchers = new Set(proxyInternal.watchers);
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

          if (watcher.lastNotifyId < currentNotifyId && proxyInternal.watchers.has(watcher)) {
            ++proxyInternal.notifyCount;
            watcher.run();
          }
        }
      }
      pendingNotifyProxyInternals.clear();

      proxyMutationAllowed = oldProxyMutationAllowed;
      pendingNotify = false;
    });
  }
};

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
    this.proxyInternals = new Set();
    this.runCount = 0;
  }

  clear() {
    for (const proxyInternal of this.proxyInternals) {
      proxyInternal.watchers.delete(this);
    }
    this.proxyInternals.clear();
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
