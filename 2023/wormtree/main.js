import {Engine} from './engine.js';
import {Worm} from './worm.js';
import {range} from './utils.js';

function main() {
  Engine.init();
  Engine.add(new Worm());
  Engine.run();
}

main();
