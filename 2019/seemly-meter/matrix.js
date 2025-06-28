const identity = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]);

const temps = [];
let nextTemp = 0;

export class Matrix {
  static create() {
    return new Float32Array(identity);
  }

  static getTemp() {
    console.assert(nextTemp < 100);
    if (nextTemp === temps.length) {
      temps.push(Matrix.create());
    }
    return temps[nextTemp++];
  }
  
  static releaseTemps(n) {
    nextTemp -= n;
    console.assert(nextTemp >= 0);
  }
  
  static reset(m) {
    m.set(identity);
  }
  
  static translate(m, x, y, z=0) {
    m[4 * 0 + 3] += x;
    m[4 * 1 + 3] += y;
    m[4 * 2 + 3] += z;
  }
  
  static scale(m, x, y=x, z=1) {
    m[4 * 0 + 0] *= x;
    m[4 * 1 + 1] *= y;
    m[4 * 2 + 3] *= z;
  }
  
  static rotateZ(matrix, angle) {
    /*
      (x + iy) * (c + is)
      xc + ixs + iyc - ys
      xc - ys + i(xs + yc)
      [
        [c,  s],
        [-s, c],
      ]
    */
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const rotation = Matrix.getTemp();
    rotation.set(identity);
    rotation[4 * 0 + 0] = c;
    rotation[4 * 0 + 1] = s;
    rotation[4 * 1 + 0] = -s;
    rotation[4 * 1 + 1] = c;
    Matrix.multiply(matrix, rotation);
    Matrix.releaseTemps(1);
  }
  
  static rotateX(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const rotation = Matrix.getTemp();
    rotation.set(identity);
    rotation[4 * 1 + 1] = c;
    rotation[4 * 1 + 2] = s;
    rotation[4 * 2 + 1] = -s;
    rotation[4 * 2 + 2] = c;
    Matrix.multiply(matrix, rotation);
    Matrix.releaseTemps(1);
  }
  
  static rotateY(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const rotation = Matrix.getTemp();
    rotation.set(identity);
    rotation[4 * 2 + 2] = c;
    rotation[4 * 2 + 0] = s;
    rotation[4 * 0 + 2] = -s;
    rotation[4 * 0 + 0] = c;
    Matrix.multiply(matrix, rotation);
    Matrix.releaseTemps(1);
  }
  
  static multiply(matrix, rhs) {
    const lhs = Matrix.getTemp();
    lhs.set(matrix);
    matrix[4 * 0 + 0] = lhs[4 * 0 + 0] * rhs[4 * 0 + 0] + lhs[4 * 0 + 1] * rhs[4 * 1 + 0] + lhs[4 * 0 + 2] * rhs[4 * 2 + 0] + lhs[4 * 0 + 3] * rhs[4 * 3 + 0];
    matrix[4 * 0 + 1] = lhs[4 * 0 + 0] * rhs[4 * 0 + 1] + lhs[4 * 0 + 1] * rhs[4 * 1 + 1] + lhs[4 * 0 + 2] * rhs[4 * 2 + 1] + lhs[4 * 0 + 3] * rhs[4 * 3 + 1];
    matrix[4 * 0 + 2] = lhs[4 * 0 + 0] * rhs[4 * 0 + 2] + lhs[4 * 0 + 1] * rhs[4 * 1 + 2] + lhs[4 * 0 + 2] * rhs[4 * 2 + 2] + lhs[4 * 0 + 3] * rhs[4 * 3 + 2];
    matrix[4 * 0 + 3] = lhs[4 * 0 + 0] * rhs[4 * 0 + 3] + lhs[4 * 0 + 1] * rhs[4 * 1 + 3] + lhs[4 * 0 + 2] * rhs[4 * 2 + 3] + lhs[4 * 0 + 3] * rhs[4 * 3 + 3];

    matrix[4 * 1 + 0] = lhs[4 * 1 + 0] * rhs[4 * 0 + 0] + lhs[4 * 1 + 1] * rhs[4 * 1 + 0] + lhs[4 * 1 + 2] * rhs[4 * 2 + 0] + lhs[4 * 1 + 3] * rhs[4 * 3 + 0];
    matrix[4 * 1 + 1] = lhs[4 * 1 + 0] * rhs[4 * 0 + 1] + lhs[4 * 1 + 1] * rhs[4 * 1 + 1] + lhs[4 * 1 + 2] * rhs[4 * 2 + 1] + lhs[4 * 1 + 3] * rhs[4 * 3 + 1];
    matrix[4 * 1 + 2] = lhs[4 * 1 + 0] * rhs[4 * 0 + 2] + lhs[4 * 1 + 1] * rhs[4 * 1 + 2] + lhs[4 * 1 + 2] * rhs[4 * 2 + 2] + lhs[4 * 1 + 3] * rhs[4 * 3 + 2];
    matrix[4 * 1 + 3] = lhs[4 * 1 + 0] * rhs[4 * 0 + 3] + lhs[4 * 1 + 1] * rhs[4 * 1 + 3] + lhs[4 * 1 + 2] * rhs[4 * 2 + 3] + lhs[4 * 1 + 3] * rhs[4 * 3 + 3];

    matrix[4 * 2 + 0] = lhs[4 * 2 + 0] * rhs[4 * 0 + 0] + lhs[4 * 2 + 1] * rhs[4 * 1 + 0] + lhs[4 * 2 + 2] * rhs[4 * 2 + 0] + lhs[4 * 2 + 3] * rhs[4 * 3 + 0];
    matrix[4 * 2 + 1] = lhs[4 * 2 + 0] * rhs[4 * 0 + 1] + lhs[4 * 2 + 1] * rhs[4 * 1 + 1] + lhs[4 * 2 + 2] * rhs[4 * 2 + 1] + lhs[4 * 2 + 3] * rhs[4 * 3 + 1];
    matrix[4 * 2 + 2] = lhs[4 * 2 + 0] * rhs[4 * 0 + 2] + lhs[4 * 2 + 1] * rhs[4 * 1 + 2] + lhs[4 * 2 + 2] * rhs[4 * 2 + 2] + lhs[4 * 2 + 3] * rhs[4 * 3 + 2];
    matrix[4 * 2 + 3] = lhs[4 * 2 + 0] * rhs[4 * 0 + 3] + lhs[4 * 2 + 1] * rhs[4 * 1 + 3] + lhs[4 * 2 + 2] * rhs[4 * 2 + 3] + lhs[4 * 2 + 3] * rhs[4 * 3 + 3];

    matrix[4 * 3 + 0] = lhs[4 * 3 + 0] * rhs[4 * 0 + 0] + lhs[4 * 3 + 1] * rhs[4 * 1 + 0] + lhs[4 * 3 + 2] * rhs[4 * 2 + 0] + lhs[4 * 3 + 3] * rhs[4 * 3 + 0];
    matrix[4 * 3 + 1] = lhs[4 * 3 + 0] * rhs[4 * 0 + 1] + lhs[4 * 3 + 1] * rhs[4 * 1 + 1] + lhs[4 * 3 + 2] * rhs[4 * 2 + 1] + lhs[4 * 3 + 3] * rhs[4 * 3 + 1];
    matrix[4 * 3 + 2] = lhs[4 * 3 + 0] * rhs[4 * 0 + 2] + lhs[4 * 3 + 1] * rhs[4 * 1 + 2] + lhs[4 * 3 + 2] * rhs[4 * 2 + 2] + lhs[4 * 3 + 3] * rhs[4 * 3 + 2];
    matrix[4 * 3 + 3] = lhs[4 * 3 + 0] * rhs[4 * 0 + 3] + lhs[4 * 3 + 1] * rhs[4 * 1 + 3] + lhs[4 * 3 + 2] * rhs[4 * 2 + 3] + lhs[4 * 3 + 3] * rhs[4 * 3 + 3];
    Matrix.releaseTemps(1);
  }
}