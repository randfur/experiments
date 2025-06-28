'use strict'

const TAU = Math.PI * 2;

function createVector(x=0, y=0, z=0, w=1) {
  return {x, y, z, w};
}

function createComputedVector(computation) {
  let result = createVector();
  computation(result);
  return result;
}

const tempVectors = [];
let nextTempVectorIndex = 0;
function getTempVector() {
  if (nextTempVectorIndex > 100) {
    throw 'You probably have a temp vector leak';
  }
  if (nextTempVectorIndex <= tempVectors.length) {
    tempVectors.push(createVector());
  }
  ++nextTempVectorIndex;
  return tempVectors[nextTempVectorIndex - 1];
}

function releaseTempVectors(n) {
  nextTempVectorIndex -= n;
}

function assignVector(x, y, z, result) {
  result.x = x;
  result.y = y;
  result.z = z;
}

function deviate(x) {
  return Math.random() * 2 * x - x;
}

function assignRotationVector(x, y, z, angle, result) {
  const imaginaryCoefficient = Math.sin(angle / 2);
  result.x = imaginaryCoefficient * x;
  result.y = imaginaryCoefficient * y;
  result.z = imaginaryCoefficient * z;
  result.w = Math.cos(angle / 2);
}

function rotateVector(vector, quaternion, result) {
  let temp = getTempVector();
  multiplyQuaternions(quaternion, vector, temp);
  let conjugate = getTempVector();
  conjugateQuaternion(quaternion, conjugate);
  multiplyQuaternions(temp, conjugate, result);
}

function conjugateQuaternion({x, y, z, w}, result) {
  result.x = -x;
  result.y = -y;
  result.z = -z;
  result.w = w;
}

function multiplyQuaternions({a, b, c, d}, {e, f, g, h}, result) {
  // (ia + jb + kc + d) * (ie + jf + kg + h)
  // iiae + ijaf + ikag + iah + jibe + jjbf + jkbg + jbh + kice + kjcf + kkcg + kch + ide + jdf + kdg + dh
  // -ae + kaf + -jag + iah + -kbe + -bf + ibg + jbh + jce + -icf + -cg + kch + ide + jdf + kdg + dh
  // i(ah + bg - cf + de) + j(-ag + bh + ce + df) + k(af - be + ch + dg) + (-ae - bf - cg + dh)
  result.x = a * h + b * g - c * f + d * e;
  result.y = -a * g + b * h + c * e + d * f;
  result.z = a * f - b * e + c * h + d * g;
  result.w = -a * e - b * f - c * g + d * h;
}

function normaliseQuaternion(result) {
  const squareLength = result.x * result.x + result.y * result.y + result.z * result.z + result.w * result.w;
  if (squareLength == 1 || squareLength == 0) {
    return;
  }
  const length = Math.sqrt(squareLength);
  result.x /= length;
  result.y /= length;
  result.z /= length;
  result.w /= length;
}