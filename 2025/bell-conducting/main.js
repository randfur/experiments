import {createObservableJsonProxy, read, write} from './third-party/rojs/src/observable-json.js';
import {render} from './third-party/rojs/src/render.js';

const namespaceURI = 'http://www.w3.org/2000/svg';

function main() {
  const model = createObservableJsonProxy({
    height: 100,
  });

  render(document.body, {
    tag: 'svg',
    namespaceURI,
    attributes: {
      width: 100,
      height: () => read(model.height),
    },
    children: [{
      tag: 'rect',
      namespaceURI,
      style: {
        fill: 'red',
      },
      attributes: {
        width: 10,
        height: 10,
        x: 10,
        y: 10,
      },
    }],
  });
}

main();