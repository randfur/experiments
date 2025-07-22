import {Vec3} from '../third-party/ga/vec3.js';
import {Temp} from '../third-party/ga/temp.js';

class Face {
  constructor(vertices, colour) {
    this.vertices = vertices;
    this.colour = colour;
  }

  *edges() {
    for (let i = 0; i < this.vertices.length; ++i) {
      yield [this.vertices[i], this.vertices[(i + 1) % this.vertices.length]];
    }
  }

  // Returns two new faces, the first has a positive dot product with the normal, the second a negative dot product.
  // If either has no vertices it will be null.
  slice(position, normal) {
    const verticesA = [];
    const verticesB = [];
    for (const [a, b] of this.edges()) {
      // Plane intersection with line segment A -> B.
      // Find point on infinite line that lies in plane at P with normal N.
      // ((A + t(B - A)) - P).N = 0
      // A.N + t(B - A).N - P.N = 0
      // t = -(A - P).N / (B - A).N
      const pToADotN = Temp.vec3().setDelta(position, a).dot(normal);
      const aToB = Temp.vec3().setDelta(a, b);
      const aToBDotN = aToB.dot(normal)
      const t = -pToADotN / aToBDotN;
      if (t > 0 && t < 1) {
        const middle = new Vec3().setScaleAdd(a, t, aToB);
        (pToADotN >= 0 ? verticesA : verticesB).push(a, middle);
        (pToADotN >= 0 ? verticesB : verticesA).push(middle, b);
      } else {
        (pToADotN >= 0 ? verticesA : verticesB).push(a);
      }
    }
    return [
      verticesA.length ? new Face(verticesA, this.colour) : null,
      verticesB.length ? new Face(verticesB, this.colour) : null,
    ];
  }

  draw(position, hexLines) {
    const temp = Temp.vec3();
    const {r, g, b, a} = this.colour;
    for (let i = 0; i <= this.vertices.length; ++i) {
      const {x, y, z} = temp.setAdd(position, this.vertices[i % this.vertices.length]);
      hexLines.addPointFlat(x, y, z, 10, r, g, b, a);
    }
    hexLines.addNull();
  }
}

class Model {
  constructor({position, faces}) {
    this.position = position;
    this.faces = faces;
  }

  // Returns two new models, the first has a positive dot product with the normal, the second a negative dot product.
  // If either has no faces it will be null.
  slice({position, normal, push}) {
    const localPosition = Temp.vec3().setDelta(this.position, position);
    const facesA = [];
    const facesB = [];
    for (const face of this.faces) {
      const [faceA, faceB] = face.slice(localPosition, normal);
      faceA && facesA.push(faceA);
      faceB && facesB.push(faceB);
    }
    // TODO: Work into the API somehow.
    facesB.forEach(face => face.colour = {r: 100, g: 0, b: 255, a: 255});
    return [
      facesA.length ? new Model({
        position: new Vec3().set(this.position).inplaceScaleAdd(0.5, push),
        faces: facesA,
      }) : null,
      facesB.length ? new Model({
        position: new Vec3().set(this.position).inplaceScaleAdd(-0.5, push),
        faces: facesB,
      }) : null,
    ];
  }

  draw(hexLines) {
    for (const face of this.faces) {
      face.draw(this.position, hexLines);
    }
  }
}

export function createBox({position, size, colour}) {
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
      new Face([frontTopLeft, frontTopRight, frontBottomRight, frontBottomLeft], colour),
      // Right.
      new Face([frontTopRight, frontBottomRight, backBottomRight, backTopRight], colour),
      // Top.
      new Face([frontTopLeft, frontTopRight, backTopRight, backTopLeft], colour),
      // Back.
      new Face([backTopLeft, backTopRight, backBottomRight, backBottomLeft], colour),
      // Left.
      new Face([frontTopLeft, backTopLeft, backBottomLeft, frontBottomLeft], colour),
      // Bottom.
      new Face([frontBottomLeft, frontBottomRight, backBottomRight, backBottomLeft], colour),
    ],
  });
}