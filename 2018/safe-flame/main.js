'use strict';

const TAU = Math.PI * 2;

const columns = (innerWidth / 12) | 0;
const rows = (innerHeight / 13) | 0;
const symbols = Array.from(' -=+#%&$@');

const cameraPosition = [0, 0, 0, 1];
const cameraOrientation = [0, 0, 0, 1];
const fuzzGridPosition = [0, 0, 20, 1];
const fuzzGridNormal = [0, 0, 1, 1];

const tempVectors = [];
let nextTempVectorIndex = 0;
function getTempVector() {
  // Hard limit to a finite number to avoid leaks going forever.
  if (nextTempVectorIndex < 100 && nextTempVectorIndex >= tempVectors.length)
    tempVectors.push([0, 0, 0, 1]);
  return tempVectors[nextTempVectorIndex++];
}

function cellValue(row, column) {
  let result = 0;
  const ray = getTempVector();
  getRay(row, column, ray);
  const fuzzPosition = getTempVector();
  const distance = intersectPlane(cameraPosition, ray, fuzzGridPosition, fuzzGridNormal, fuzzPosition);
  // if (Math.abs(distance) < 20)
    result = fuzzValue(fuzzPosition[0], fuzzPosition[1]);
  releaseTempVector(2);
  return result;
}

let seed = 1;
function random() {
  seed ^= 12345;
	seed ^= seed << 13;
	seed ^= seed >> 17;
	seed ^= seed << 5;
	return Math.abs(seed / (1 << 31));
}

function fuzzValue(x, y) {
  seed = 12345 + Math.floor(x) + Math.floor(y) * 1e5;
  for (let i = 0; i < 2; ++i)
    random();
  let result = 1;
  for (let i = 0; i < 2; ++i)
    result *= random();
  return result;
}

function releaseTempVector(count = 1) {
  nextTempVectorIndex -= count;
}

function getRay(row, column, output) {
  const ray = getTempVector();
  ray[0] = (column / (columns - 1) - 0.5) * columns / rows;
  ray[1] = 0.5 - row / (rows - 1);
  ray[2] = 1;
  ray[3] = 1;
  rotate(ray, cameraOrientation, output);
  normaliseVector(output);
  releaseTempVector();
}

function rotate(vector, quaternion, output) {
  const quaternionConjugate = getTempVector();
  conjugate(quaternion, quaternionConjugate);
  const firstMultiply = getTempVector();
  quaternionMultiply(quaternion, vector, firstMultiply);
  quaternionMultiply(firstMultiply, quaternionConjugate, output);
  releaseTempVector(2);
}

function conjugate(quaternion, output) {
  output[0] = -quaternion[0];
  output[1] = -quaternion[1];
  output[2] = -quaternion[2];
  output[3] = quaternion[3];
}

// (ia + jb + kc + d) * (ie + jf + kg + h)
// iiae + ijaf + ikag + iah + jibe + jjbf + jkbg + jbh + kice + kjcf + kkcg + kch + ide + jdf + kdg + dh
// -ae + kaf - jag + iah - kbe - bf + ibg + jbh + jce - icf - cg + kch + ide + jdf + kdg + dh
// i(ah + bg + de - cf) + j(bh + ce + df - ag) + k(af + ch + dg - be) + dh - ae - bf - cg
function quaternionMultiply(quaternionA, quaternionB, output) {
  const a = quaternionA[0];
  const b = quaternionA[1];
  const c = quaternionA[2];
  const d = quaternionA[3];
  const e = quaternionB[0];
  const f = quaternionB[1];
  const g = quaternionB[2];
  const h = quaternionB[3];
  output[0] = a * h + b * g + d * e - c * f;
  output[1] = b * h + c * e + d * f - a * g;
  output[2] = a * f + c * h + d * g - b * e;
  output[3] = d * h - a * e - b * f - c * g;
}

function intersectPlane(position, direction, planePosition, planeNormal, output) {
  const positionDelta = getTempVector();
  delta(planePosition, position, positionDelta);
  const shortestDelta = getTempVector();
  project(positionDelta, planeNormal, shortestDelta);
  const distance = vectorLength(shortestDelta) / (dot(direction, planeNormal) || 1);
  addScaled(position, direction, distance, output);
  releaseTempVector(2);
  return distance;
}

function delta(vectorA, vectorB, output) {
  output[0] = vectorB[0] - vectorA[0];
  output[1] = vectorB[1] - vectorA[1];
  output[2] = vectorB[2] - vectorA[2];
}

function addScaled(vectorA, vectorB, k, output) {
  output[0] = vectorA[0] + vectorB[0] * k;
  output[1] = vectorA[1] + vectorB[1] * k;
  output[2] = vectorA[2] + vectorB[2] * k;
}

function project(vector, direction, output) {
  const distance = dot(vector, direction);
  output[0] = direction[0] * distance;
  output[1] = direction[1] * distance;
  output[2] = direction[2] * distance;
}

function dot(vectorA, vectorB) {
  return vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2];
}

function copy(source, destination) {
  destination[0] = source[0];
  destination[1] = source[1];
  destination[2] = source[2];
  destination[3] = source[3];
}

function normaliseVector(output) {
  const length = vectorLength(output) || 1;
  output[0] /= length;
  output[1] /= length;
  output[2] /= length;
}

function vectorLength(vector) {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
}

function normaliseQuaternion(output) {
  const length = Math.sqrt(output[0] * output[0] + output[1] * output[1] + output[2] * output[2] + output[3] * output[3]) || 1;
  output[0] /= length;
  output[1] /= length;
  output[2] /= length;
  output[3] /= length;
}

function rotation(x, y, z, angle, output) {
  const k = Math.sin(angle / 2) / (Math.sqrt(x * x + y * y + z * z) || 1);
  output[0] = x * k;
  output[1] = y * k;
  output[2] = z * k;
  output[3] = Math.cos(angle / 2);
}
  
function pickPercentage(array, percentage) {
  return array[Math.min(percentage * array.length, array.length - 1) | 0];
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i)
    result.push(i);
  return result;
}

function updateState(time) {
  cameraPosition[0] = Math.cos(time / 8000) * 20;
  cameraPosition[1] = Math.cos(time / 9000) * 40;
  cameraPosition[2] = 18 + Math.cos(time / 700);
  const orientationDelta = getTempVector();
  rotation(-Math.abs(Math.cos(time / 900)), -Math.abs(Math.sin(time / 1300)), 1, TAU / 1000, orientationDelta);
  quaternionMultiply(orientationDelta, cameraOrientation, cameraOrientation);
  releaseTempVector(1);
}

const rowTexts = range(rows);
function renderState() {
  for (let row = 0; row < rows; ++row) {
    let rowText = '';
    for (let column = 0; column < columns; ++column) {
      rowText += pickPercentage(symbols, cellValue(row, column)) + ' ';
    }
    rowTexts[row] = rowText;
  }
  pre.textContent = rowTexts.join('\n');
}

function frame(time) {
  updateState(time);
  renderState();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);