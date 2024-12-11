import {Engine} from './engine.js';
import {Collisions} from './collisions.js';
import {Ship} from './ship.js';
import {repeat} from './utils.js';

function main() {
  Engine.init();

  const collisions = new Collisions();
  collisions.init();

  repeat(20, () => {
    Engine.add(new Ship(collisions));
  });

  Engine.run();
}

main();