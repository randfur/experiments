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

export function render(container, template, parentSpan=null) {
  if (parentSpan === null) {
    if (!(containerSpanKey in container)) {
      container[containerSpanKey] = new SpanBranch();
    }
    parentSpan = container[containerSpanKey];
  }

  if (typeof template === 'string') {
    renderString(container, template, parentSpan);
  } else if (isObservableJsonProxy(template)) {
    renderProxy(container, template, parentSpan);
    // TODO
  } else if (template instanceof Array) {
    renderArray(container, template, parentSpan);
    // TODO
  } else if (typeof template === 'function') {
    renderFunction(container, template, parentSpan);
    // TODO
  } else if (template instanceof HtmlIf) {
    renderIf(container, template, parentSpan);
    // TODO
  } else if (template instanceof HtmlSwitch) {
    renderSwitch(container, template, parentSpan);
    // TODO
  } else if (template instanceof HtmlMap) {
    renderMap(container, template, parentSpan);
    // TODO
  } else {
    console.assert(typeof template === 'object');
    renderElement(container, template, parentSpan);
  }
}

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

const containerSpanKey = Symbol();

function renderString(container, string, parentSpan) {
  container[containerSpanKey].push(new SpanLeaf(1))
  container.append(document.createTextNode(string));
}

function renderProxy(container, proxy, parentSpan) {
  container[containerSpanKey].push(new SpanLeaf(1))

  const textNode = document.createTextNode('');
  container.append(textNode);
  watch(proxy, value => {
    textNode.textContent = value;
  });
}

function renderArray(container, arrayTemplate, parentSpan) {
  // for (const template of arrayTemplate) {
  //   render(container, template);
  // }
  // TODO
}

function renderFunction(container, f, parentSpan) {
  const containerSegment = createContainerSegment(0);
  watch(f, template => {
    clearContainerSegment(container, containerSegment);
  });
  // TODO
}

function renderIf(container, ifTemplate, parentSpan) {
  // TODO
}

function renderSwitch(container, switchTemplate, parentSpan) {
  // TODO
}

function renderMap(container, mapTemplate, parentSpan) {
  // TODO
}

function renderElement(container, elementTemplate, parentSpan) {
  let {
    tag='div',
    style={},
    // TODO: events={},
    children=[],
  } = elementTemplate;

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

  for (let [attribute, readingValue] of Object.entries(elementTemplate)) {
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

  container.append(element);
}

class Span {
  constructor() {
    this.key = Symbol();
  }
}

class SpanLeaf extends Span {
  constructor(size) {
    super();
    this.size = size;
  }

  size() {
    return size;
  }
}

class SpanBranch extends Span {
  constructor() {
    super();
    this.children = [];
  }

  size() {
    let size = 0;
    for (const childSpan of this.children) {
      size += childSpan.size();
    }
    return size;
  }
}
