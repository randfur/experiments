import {Engine} from './engine.js';
import {Ship} from './ship.js';
import {repeat} from './utils.js';

function main() {
  Engine.init();
  repeat(10, () => {
    Engine.add(new Ship());
  });
  Engine.run();
}

main();