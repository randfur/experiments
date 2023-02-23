import {
  popKeys,
} from './utils.js';
import {
  lockAccessing,
  lockMutating,
  watch,
} from './observable-json.js';

export function render(container, generateElementTemplate) {
  // TODO:
  // - Register HTML pieces that require re-rendering for reads and member accesses.
  // - Clear registrations when things get re-rendered.
  return lockMutating(() => {
    return renderElementTemplate(
      container,
      lockAccessing(generateElementTemplate),
    );
  });
}

function renderElementTemplate(container, elementTemplate) {
  const {tag, style, events, children} = popKeys(elementTemplate, {
    tag: 'div',
    style: {},
    events: {},
    children: [],
  });
  console.assert(typeof tag === 'string');
  const element = document.createElement(tag);

  console.assert(typeof style === 'object');
  // TODO: Allow style to be a readingValue.
  for (const [property, readingValue] of Object.entries(style)) {
    watch(readingValue, value => {
      if (property.startsWith('-')) {
        element.style.setProperty(property, value);
      } else {
        element.style[property] = value;
      }
    });
  }

  // TODO: events

  for (let [property, readingValue] of Object.entries(elementTemplate)) {
    watch(readingValue, value => {
      element[property] = value
    });
  }

  // TODO: children

  container.append(element);
}

////////////////////////////////////////////////////////////////
// HTML branches
////////////////////////////////////////////////////////////////

class HtmlList {
  constructor(listModel, generateItemTemplate) {
    this.listModel = listModel;
    this.generateItemTemplate = generateItemTemplate;
  }
}

function htmlList(listModel, generateItemTemplate) {
  return new HtmlList(listModel, generateItemTemplate);
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

