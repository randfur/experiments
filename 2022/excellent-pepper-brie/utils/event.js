const eventStates = Symbol();

function resolvablePromise() {
  let resolve = null;
  const promise = new Promise(r => resolve = r);
  promise.resolve = resolve;
  return promise;
}

export async function nextEvent(target, eventName, predicate=null) {
  while (true) {
    const event = await nextEventUnconditional(target, eventName);
    if (!predicate || predicate(event)) {
      return event;
    }
  }
}

export function nextOfEvents(target, eventNames, predicate=null) {
  return Promise.race(eventNames.map(eventName => nextEvent(target, eventName, predicate)));
}

function nextEventUnconditional(target, eventName) {
  if (!(eventStates in target)) {
    target[eventStates] = {};
  }
  if (!target[eventStates][eventName]) {
    target[eventStates][eventName] = {
      promise: null,
      listening: false,
    };
  }
  const eventState = target[eventStates][eventName];
  if (!eventState.promise) {
    eventState.promise = resolvablePromise();
  }
  if (!eventState.listening) {
    function eventHandler(event) {
      if (eventState.promise) {
        eventState.promise.resolve(event);
        eventState.promise = null;
      } else {
        target.removeEventListener(eventName, eventHandler);
        eventState.listening = false;
      }
    }
    target.addEventListener(eventName, eventHandler);
    eventState.listening = true;
  }
  return eventState.promise;
}
