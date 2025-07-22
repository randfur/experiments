function c(value) {
  return {operation: 'constant', value};
}

function m(left, right) {
  return {operation: 'multiply', left, right};
}

function d(numerator, denominator) {
  return {operation: 'divide', numerator, denominator};
}

function a(left, right) {
  return {operation: 'add', left, right};
}

function s(left, right) {
  return {operation: 'subtract', left, right};
}

function evaluate(expression, constantMap) {
  switch (expression.operation) {
  case 'constant':
    if (typeof expression.value === 'string') {
      return constantMap[expression.value];
    }
    return expression.value;
  case 'multiply':
    return evaluate(expression.left, constantMap) * evaluate(expression.right, constantMap);
  case 'divide':
    return evaluate(expression.numerator, constantMap) / evaluate(expression.denominator, constantMap);
  case 'add':
    return evaluate(expression.left, constantMap) + evaluate(expression.right, constantMap);
  case 'subtract':
    return evaluate(expression.left, constantMap) - evaluate(expression.right, constantMap);
  }
  throw new Error();
}

// ab + be + cf = g
// ae - bd = h
// af - cd = i
// bf - ce = j
const augmentedMatrix = [
  [c('d'), c('e'), c('f'), c('g')],
  [c('e'), m(c('d'), c(-1)), c(0), c('h')],
  [c('f'), c(0), m(c('d'), c(-1)), c('i')],
  [c(0), c('f'), m(c('e'), c(-1)), c('j')],
];
const columnNames = ['a', 'b', 'c'];

function main() {

}