import {createObservableJsonProxy, readWrite, write} from '../third-party/rojs/src/observable-json.js';
import {render} from '../third-party/rojs/src/render.js';

function main() {
  const model = createObservableJsonProxy({
    value: 0,
    debugOutput: '',
  });

  function addDebugOutput(text) {
    readWrite(model.debugOutput, output => `${Math.floor(performance.now())}: ${text}\n${output}`);
  }

  render(document.body, [
    {
      tag: 'input',
      type: 'range',
      value: model.value,
      events: {
        input: event => {
          addDebugOutput('input event');
          write(model.value, event.target.value);
        },
        change: event => {
          addDebugOutput('change event');
          write(model.value, event.target.value);
        },
      },
    },
    {
      tag: 'button',
      events: {
        click: event => {
          write(model.value, Math.random() * 100);
        },
      },
      textContent: 'Set from JS',
    },
    {
      tag: 'pre',
      textContent: model.debugOutput,
    },
  ]);
}

main();
