import {Vec3} from '../../third-party/ga/vec3.js';
import {PlaneBasis} from '../../third-party/ga/plane-basis.js';

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

class Model {
  constructor(faces) {
    this.faces = faces;
  }

  split({position, direction, cuts, distance}) {
    const planeBasis = PlaneBasis.temp(position, direction);
    const planeCuts = cuts.map(cut => cut.clone().inplacePlaneProjection2d(planeBasis));
    const intersectingFaces = [];
    for (const face of this.faces) {

    }

    return [];
  }

  draw(hexLines) {
    for (const face of this.faces) {
      for (let i = 0; i <= face.positions.length; ++i) {
        const {x, y, z} = face.positions[i % face.positions.length];
        const {r, g, b} = face.colour;
        hexLines.addPointFlat(x, y, z, face.size, r, g, b, 255);
      }
      hexLines.addNull();
    }
  }
}

function getBidirectionalEdgeMap(edgeMap) {
  const result = {};
  for (const from of edgeMap) {
    for (const to of edgeMap[from]) {
      addEdge(result, from, to);
      addEdge(result, to, from);
    }
  }
  return result;
}

function addEdge(edgeMap, from, to) {
  if (!edgeMap[from]) {
    edgeMap[from] = [];
  }
  edgeMap[from].push(to);
}
