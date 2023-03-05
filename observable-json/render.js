import {
  watch,
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
  } else {
    console.assert(typeof template === 'object');
    const {
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

    // TODO: children

    container.append(element);
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
  constructor(listModel, generateItemTemplate) {
    this.listModel = listModel;
    this.generateItemTemplate = generateItemTemplate;
  }
}

function htmlMap(listModel, generateItemTemplate) {
  return new HtmlMap(listModel, generateItemTemplate);
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

