export function createElement(params) {
  const {
    tag,
    namespaceUri='http://www.w3.org/1999/xhtml',
    classes,
    style,
    events,
    attributes,
    children,
    ...properties
  } = params;
  const element = document.createElementNS(namespaceUri, tag);

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