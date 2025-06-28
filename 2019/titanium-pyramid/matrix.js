import {assertTrue, TAU} from './utils.js';

export class Matrix {
  constructor(lol) {
    if (lol.length == 0 || lol[0].length == 0)
      throw 'aaaaaaaa';
    this.lol = lol;
  }
  
  rows() {
    return this.lol.length;
  }
  
  cols() {
    return this.lol[0].length;
  }
  
  multiply(other) {
    if (this.cols() != other.rows())
      throw 'cannot multiply';
    const result = [];
    // A x B
    // A rows times B columns
    // [1  1  2]   [1 2]   [a b]
    // [2  1  3] * [3 4] = [c d]
    // [3  1  4]   [5 6]   [e f]
  
    for (let i = 0; i < this.rows(); ++i) {
      const resultRow = [];
      for (let j = 0; j < other.cols(); ++j) {
        let sum = 0;
        for (let k = 0; k < other.rows(); ++k) {
          sum += this.lol[i][k] * other.lol[k][j];
        }
        resultRow.push(sum);
      }
      result.push(resultRow);
    }
    return new Matrix(result);
  }
  
  toString() {
    let result = '';
    for (let i = 0; i < this.rows(); ++i) {
      for (let j = 0; j < this.cols(); ++j) {
        result += this.lol[i][j] + ' ';
      }
      result += '\n';
    }
    return result;
  }
  
  equals(other) {
    if (this.rows() != other.rows())
      return false;
    if (this.cols() != other.cols())
      return false;
    for (let i = 0; i < this.rows(); ++i) {
      for (let j = 0; j < this.cols(); ++j) {
        if (Math.abs(this.lol[i][j] - other.lol[i][j]) > 1/1000)
          return false;
      }
    }
    return true;
  }
  
  static createRotateX(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // (y + iz) * (cos + isin) = y' + iz'
    // ycos - zsin + i(ysin + zcos)
    return new Matrix([
      [1, 0, 0],
      [0, cos, -sin],
      [0, sin, cos],
    ]);
  }

  static createRotateY(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // (z + ix) * (cos + isin) = z' + ix'
    // zcos - xsin + i(zsin + xcos)
    return new Matrix([
      [cos, 0, sin],
      [0, 1, 0],
      [-sin, 0, cos],
    ]);
  }
}

const testing = true;
if (testing) {
  const a = new Matrix([
    [1, 2],
    [4, 5],
    [8, 9],
  ]);
  const b = new Matrix([
    [1, 2, 4],
    [4, 5, 7],
  ]);

  const c = a.multiply(b);
  assertTrue(c.equals(new Matrix([
    [9, 12, 18],
    [24, 33, 51],
    [44, 61, 95],
  ])));
  
  const d = b.multiply(a);
  assertTrue(d.equals(new Matrix([
    [41, 48],
    [80, 96],
  ])));
  
  const rotateVector = new Matrix([
    [0],
    [1],
    [0],
  ]);
  const rotatedVector =
      Matrix.createRotateX(TAU / 4).multiply(rotateVector);
  assertTrue(
    rotatedVector.equals(
      new Matrix([
        [0],
        [0],
        [1],
      ])
    ),
    rotatedVector.toString()
  );
}


