const ZERO = 0;
const ONE = 1;
const SRC_COLOR = 2;
const ONE_MINUS_SRC_COLOR = 3;
const DST_COLOR = 4;
const ONE_MINUS_DST_COLOR = 5;
const SRC_ALPHA = 6;
const ONE_MINUS_SRC_ALPHA = 7;
const DST_ALPHA = 8;
const ONE_MINUS_DST_ALPHA = 9;
const SRC_ALPHA_SATURATE = 10;

const types = [
  ZERO,
  ONE,
  SRC_COLOR,
  ONE_MINUS_SRC_COLOR,
  DST_COLOR,
  ONE_MINUS_DST_COLOR,
  SRC_ALPHA,
  ONE_MINUS_SRC_ALPHA,
  DST_ALPHA,
  ONE_MINUS_DST_ALPHA,
  SRC_ALPHA_SATURATE,
];

function getCombinations(items, count) {
  if (count === 1) {
    return items.map(item => [item]);
  }
  const combinations = getCombinations(items, count - 1);
  return items.flatMap(item => combinations.map(combination => combination.concat([item])));
}

function getRgbFactor(type, sourceColour, destinationColour) {
  switch (type) {
  case ZERO:
    return;
  case ONE:
    return;
  case SRC_COLOR:
    return;
  case ONE_MINUS_SRC_COLOR:
    return;
  case DST_COLOR:
    return;
  case ONE_MINUS_DST_COLOR:
    return;
  case SRC_ALPHA:
    return;
  case ONE_MINUS_SRC_ALPHA:
    return;
  case DST_ALPHA:
    return;
  case ONE_MINUS_DST_ALPHA:
    return;
  case SRC_ALPHA_SATURATE:
    return;
  }
}

function getAlphaFactor(type, sourceColour, destinationColour) {
  switch (type) {
  case ZERO:
    return;
  case ONE:
    return;
  case SRC_COLOR:
    return;
  case ONE_MINUS_SRC_COLOR:
    return;
  case DST_COLOR:
    return;
  case ONE_MINUS_DST_COLOR:
    return;
  case SRC_ALPHA:
    return;
  case ONE_MINUS_SRC_ALPHA:
    return;
  case DST_ALPHA:
    return;
  case ONE_MINUS_DST_ALPHA:
    return;
  case SRC_ALPHA_SATURATE:
    return;
  }
}

async function main() {
  const typeCombinations = getCombinations(types, 4);
  console.log(typeCombinations);
}

main();
