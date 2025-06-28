import {createSignal} from "https://cdn.skypack.dev/solid-js";
import { render } from "https://cdn.skypack.dev/solid-js/web";
import html from "https://cdn.skypack.dev/solid-js/html";

class Bone {
  constructor() {
    this.type = 'chewy';
  }
}

class Dog {
  constructor() {
    this.html = html`<div>
      I am a dog.
    </div>`;
  }
}

function main() {
  const dog = new Dog();
  render(() => dog.html, document.body);
}
main();