import {
  sleep,
  random,
  coinFlip,
} from './utils.js';
import {
  createObservableJson,
  write,
  read,
} from './observable-json.js';
import {
  render,
} from './rendering.js';

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
    return {
      style: {
        color: () => read(model.blue) ? 'blue' : 'grey',
      },
      textContent: model.cow,
    };
  });
}

// ////////////////////////////////////////////////////////////////
// // Proxy
// ////////////////////////////////////////////////////////////////

// const jsonProxyInternals = Symbol();
// const observableJsonProxyHandler = {
//   get(target, property, receiver) {
//     if (property === jsonProxyInternals) {
//       return target;
//     }
//     if (!(property in target.subProxies)) {
//       target.subProxies[property] = new Proxy({
//         parent: target,
//         property,
//         subProxies: {},
//         writeObservers: [],
//       }, observableJsonProxyHandler);
//     }
//     return target.subProxies[property];
//   },
//   has(target, property, receiver) {
//     console.assert(false);
//   },
//   set(target, property, value, receiver) {
//     console.assert(false);
//   },
// };

// export function createObservableJson(json) {
//   return new Proxy({
//     json,
//     subProxies: {},
//     writeObservers: [],
//   }, observableJsonProxyHandler);
// }

// function isJsonProxy(object) {
//   return Boolean(object[jsonProxyInternals]);
// }

// ////////////////////////////////////////////////////////////////
// // Proxy access
// ////////////////////////////////////////////////////////////////

// let modelAccessAllowed = true;
// let modelMutationAllowed = true;
// let writeObserver = null;

// export function read(proxy) {
//   console.assert(modelAccessAllowed);
//   const internals = proxy[jsonProxyInternals];
//   if (writeObserver) {
//     internals.writeObservers.push(writeObserver);
//   }
//   return traverseForRead(internals);
// }

// function traverseForRead(internals) {
//   if ('json' in internals) {
//     return internals.json;
//   }
//   const {parent, property} = internals;
//   return traverseForRead(parent)[property];
// }

// export function write(proxy, value) {
//   console.assert(isJsonProxy(proxy));
//   console.assert(modelAccessAllowed);
//   console.assert(modelMutationAllowed);
//   const internals = proxy[jsonProxyInternals];
//   if ('json' in internals) {
//     internals.json = value;
//   } else {
//     const {parent, property} = internals;
//     traverseForRead(parent)[property] = value;
//   }
//   for (const writeObserver of internals.writeObservers) {
//     writeObserver();
//   }
// }

// export function mutate(proxy, mutator) {
//   console.assert(modelAccessAllowed);
//   console.assert(modelMutationAllowed);
//   const internals = proxy[jsonProxyInternals];
//   mutator(traverseForRead(internals));
//   for (const writeObserver of internals.writeObservers) {
//     writeObserver();
//   }
// }

// function watch(readingValue, f) {
//   if (isJsonProxy(readingValue)) {
//     writeObserver = () => {
//       f(read(readingValue));
//     };
//     writeObserver();
//     writeObserver = null;
//   } else if (typeof readingValue === 'function') {
//     writeObserver = () => {
//       f(readingValue());
//     };
//     writeObserver();
//     writeObserver = null;
//   } else {
//     f(readingValue);
//   }
// }

