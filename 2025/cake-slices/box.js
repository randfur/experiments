import {Vec3} from '../../third-party/ga/vec3.js';
import {Model} from './model.js';

export function createBox(dimensions, size, colour) {
  const x = dimensions.x / 2;
  const y = dimensions.y / 2;
  const z = dimensions.z / 2;
  const vertex000 = new Vec3(-x, -y, -z);
  const vertex001 = new Vec3(-x, -y, z);
  const vertex010 = new Vec3(-x, y, -z);
  const vertex011 = new Vec3(-x, y, z);
  const vertex100 = new Vec3(x, -y, -z);
  const vertex101 = new Vec3(x, -y, z);
  const vertex110 = new Vec3(x, y, -z);
  const vertex111 = new Vec3(x, y, z);
  return new Model([{
    size,
    colour,
    positions: [vertex000, vertex001, vertex011, vertex010],
  }, {
    size,
    colour,
    positions: [vertex100, vertex101, vertex111, vertex110],
  }, {
    size,
    colour,
    positions: [vertex000, vertex001, vertex101, vertex100],
  }, {
    size,
    colour,
    positions: [vertex010, vertex011, vertex111, vertex110],
  }, {
    size,
    colour,
    positions: [vertex000, vertex010, vertex110, vertex100],
  }, {
    size,
    colour,
    positions: [vertex001, vertex011, vertex111, vertex101],
  }]);
}
