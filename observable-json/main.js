import {nonReactiveExample} from './non-reactive.js';
import {reactiveExample} from './reactive.js';

async function main() {
  await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));

  // document.body.append(nonReactiveExample());
  reactiveExample();
}

main();
