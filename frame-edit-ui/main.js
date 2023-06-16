import {render, htmlSwitch} from './third-party/rojs/src/render.js';
import {createObservableJsonProxy, write} from './third-party/rojs/src/observable-json.js';

const proxy = createObservableJsonProxy({hello: true});

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
context.fillRect(30, 40, 100, 100);

setTimeout(() => write(proxy.hello, false), 1000);

render(app, htmlSwitch(proxy.hello, {
  true: canvas,
  false: {
    tag: 'ol',
    children: [{
      tag: 'li',
      children: [canvas],
    }],
  },
}));