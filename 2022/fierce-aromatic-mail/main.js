import {createSignal} from 'https://cdn.skypack.dev/solid-js';
import {render} from 'https://cdn.skypack.dev/solid-js/web';
import html from 'https://cdn.skypack.dev/solid-js/html';


class Dogs {
  constructor(count) {
    [this.count, this.setCount] = createSignal(count);
    this.html = html`<div>
      There are ${this.count} dogs.
    </div>`;
  }
}

function App() {
  const [count, setCount] = createSignal(0);
  const div = html`<div>Count is: ${count}</div>`;
  setTimeout(() => {
    setCount(100);
    console.log(div.textContent);
  }, 1000);
  return html`<div>Does not include the other div.</div>`;
}

render(App, document.body);