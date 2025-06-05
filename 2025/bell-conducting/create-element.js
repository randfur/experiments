const pendingEventListeners = new Map();

export function createElement(params) {
  const {
    tag,
    namespaceUri='http://www.w3.org/1999/xhtml',
    id,
    classes,
    style,
    events,
    parentEvents,
    attributes,
    children,
    ...properties
  } = params;
  const element = document.createElementNS(namespaceUri, tag);

  if (id) {
    element.id = id;
  }

  if (classes) {
    for (const className of classes) {
      element.classList.add(className);
    }
  }

  if (style) {
    for (const [propertyName, value] of Object.entries(style)) {
      element.style[propertyName] = value;
    }
  }

  if (events) {
    for (const [eventName, listener] of Object.entries(events)) {
      element.addEventListener(eventName, listener);
    }
  }

  if (parentEvents) {
    for (const [parentId, events] of Object.entries(parentEvents)) {
      if (!pendingEventListeners.has(parentId)) {
        pendingEventListeners.set(parentId, []);
      }
      pendingEventListeners.get(parentId).push({listeningElement: element, events});
    }
  }

  if (pendingEventListeners.has(id)) {
    for (const {listeningElement, events} of pendingEventListeners.get(id)) {
      console.log({listeningElement, events});
      for (const [eventName, listener] of Object.entries(events)) {
        element.addEventListener(eventName, event => listener(event, listeningElement));
      }
    }
    pendingEventListeners.delete(id);
  }

  if (attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
  }

  for (const [name, value] of Object.entries(properties)) {
    element[name] = value;
  }

  if (children) {
    element.append(...children);
  }

  return element;
}

export function createSvgElement(params) {
  return createElement({
    ...params,
    namespaceUri: 'http://www.w3.org/2000/svg',
  });
}

export function createText(text) {
  return document.createTextNode(text);
}