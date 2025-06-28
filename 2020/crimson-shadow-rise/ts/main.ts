import { Page } from './page';
import { Mouse } from './mouse';

let selectedTool = null;

async function main() {
  console.log(Mouse);
  while (true) {
    await new Promise(requestAnimationFrame);
  }
}

main();