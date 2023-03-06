import {
  watch,
  isObservableJsonProxy,
} from './observable-json.js';

/*
# Public

import {ReadingValue} from './observable-json.js';

export type Template = ElementTemplate | HtmlIf | HtmlSwitch | HtmlMap;

export interface ElementTemplate {
  tag: string,
  style: ReadingValue<interface {
    [cssProperty: string]: ReadingValue<string>;
  }>;
  children: ReadingValue<Array<Template>>;
  [attribute: string]: ReadingValue<string>;
}

class HtmlIf {
  constructor(condition: ReadingValue<bool>, trueBranch: Template, falseBranch: Template);
  // TODO
}

class HtmlSwitch<T> {
  constructor(value: ReadingValue<T>, interface { [value: T]: ReadingValue<Template> });
  // TODO
}

class HtmlMap<T> {
  constructor(value: ReadingValue<Array<T>>, (value: T) => Template);
  // TODO
}

export function render(container: HTMLElement, elementTemplate: Template);

// TODO: Complete.

*/

export function render(container, template) {
  // TODO: Set up children template tracking.
  if (template instanceof HtmlIf) {
    // TODO
  } else if (template instanceof HtmlSwitch) {
    // TODO
  } else if (template instanceof HtmlMap) {
    // TODO
  } else if (template instanceof Array) {
    // TODO
  } else if (typeof template === 'function') {
    // TODO
  } else if (isObservableJsonProxy(template)) {
    // TODO
  } else if (typeof template === 'string') {
    // TODO
  } else {
    console.assert(typeof template === 'object');
    let {
      tag='div',
      style={},
      // TODO: events={},
      children=[],
    } = template;

    console.assert(typeof tag === 'string');
    const element = document.createElement(tag);

    watch(style, style => {
      element.style.cssText = '';
      for (const [property, readingValue] of Object.entries(style)) {
        watch(readingValue, value => {
          if (property.startsWith('-')) {
            element.style.setProperty(property, value);
          } else {
            element.style[property] = value;
          }
        });
      }
    });

    // TODO: events

    for (let [attribute, readingValue] of Object.entries(template)) {
      switch (attribute) {
      case 'tag':
      case 'style':
      case 'events':
      case 'children':
        break;
      default:
        watch(readingValue, value => {
          element[attribute] = value
        });
        break;
      }
    }

    if (!(children instanceof Array)) {
      children = [children];
    }
    for (const childTemplate of children) {
      render(element, childTemplate);
    }

    updateTemplatedChildren(container, template, [element]);
  }
}

////////////////////////////////////////////////////////////////
// HTML branches
////////////////////////////////////////////////////////////////

class HtmlIf {
  // TODO
}

class HtmlSwitch {
  // TODO
}

class HtmlMap {
  constructor(listProxy, generateItemTemplate) {
    this.listProxy = listProxy;
    this.generateItemTemplate = generateItemTemplate;
  }
}

export function htmlMap(listProxy, generateItemTemplate) {
  return new HtmlMap(listProxy, generateItemTemplate);
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

/*
# Private
*/
const childrenLogKey = Symbol();

function updateTemplatedChildren(container, template, children) {
  if (!(childrenLogKey in container)) {
    container[childrenLogKey] = new Map();
  }
  const childrenLog = container[childrenLogKey];

  if (!childrenLog.has(template)) {
    childrenLog.set(template, {
      index: container.childNodes.length,
      length: children.length,
    });
    container.append(...children);
    return;
  }

  const childLog = childrenLog.get(template);
  const oldLength = childLog.length;
  for (let i = 0; i < oldLength; ++i) {
    container.removeChild(container.childNodes[childLog.index]);
  }
  const referenceNode = childLog.index >= container.childNodes.length ? null : container.childNodes[childLog.index];
  for (let i = 0; i < children.length; ++i) {
    container.insertBefore(children[i], referenceNode);
  }

  childLog.length = children.length;
  const delta = childLog.length - oldLength;
  for (const otherChildLog of Object.values(childrenLog)) {
    if (otherChildLog.index > childLog.index) {
      otherChildLog.index += delta;
    }
  }
}