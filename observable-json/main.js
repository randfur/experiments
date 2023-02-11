import {nonReactive} from './non-reactive.js';
import {reactive} from './reactive.js';

async function main() {
  await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));

  document.body.append(nonReactiveExample());
  document.body.append(reactiveExample());
}

main();
