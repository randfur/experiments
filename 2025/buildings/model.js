import {Vec3} from '../third-party/ga/vec3.js';
import {Temp} from '../third-party/ga/temp.js';

class Face {
  constructor(vertices) {
    this.vertices = vertices;
  }

  *edges() {
    for (let i = 0; i < this.vertices.length; ++i) {
      yield [this.vertices[i], this.vertices[(i + 1) % this.vertices.length]];
    }
  }

  draw(position, hexLines) {
    const temp = Temp.vec3();
    for (let i = 0; i <= this.vertices.length; ++i) {
      const {x, y, z} = temp.setAdd(position, this.vertices[i % this.vertices.length]);
      hexLines.addPointFlat(x, y, z, 10, 255, 255, 255, 255);
    }
    hexLines.addNull();
  }
}

class Model {
  constructor({position, faces}) {
    this.position = position;
    this.faces = faces;
  }

  draw(hexLines) {
    for (const face of this.faces) {
      face.draw(this.position, hexLines);
    }
  }
}

export function createBox({position, size}) {
  const {x, y, z} = Temp.vec3().setScale(0.5, size);
  const frontTopLeft = new Vec3(-x, -y, -z);
  const frontTopRight = new Vec3(x, -y, -z);
  const frontBottomLeft = new Vec3(-x, y, -z);
  const frontBottomRight = new Vec3(x, y, -z);
  const backTopLeft = new Vec3(-x, -y, z);
  const backTopRight = new Vec3(x, -y, z);
  const backBottomLeft = new Vec3(-x, y, z);
  const backBottomRight = new Vec3(x, y, z);
  return new Model({
    position,
    faces: [
      // Front.
      new Face([frontTopLeft, frontTopRight, frontBottomRight, frontBottomLeft]),
      // Right.
      new Face([frontTopRight, frontBottomRight, backBottomRight, backTopRight]),
      // Top.
      new Face([frontTopLeft, frontTopRight, backTopRight, backTopLeft]),
      // Back.
      new Face([backTopLeft, backTopRight, backBottomRight, backBottomLeft]),
      // Left.
      new Face([frontTopLeft, backTopLeft, backBottomLeft, frontBottomLeft]),
      // Bottom.
      new Face([frontBottomLeft, frontBottomRight, backBottomRight, backBottomLeft]),
    ],
  });
}