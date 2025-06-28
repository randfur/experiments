import {
  random,
  deviate,
  randomRange,
  randomChoice,
  range,
  assert,
  sum,
} from './utils.js';

function randomCoefficient(term, max) {
  return `(${term} * ${deviate(max).toFixed(2)})`;
}

const branchTypes = {
  trig: {
    weight: 5,
    getsBig: false,
    generate(level, avoidBig) {
      const func = randomChoice(['sin', 'cos']);
      const param = generateSubTree(level + 1, true);
      return randomCoefficient(`Math.${func}(${param})`, 10);
    },
  },
  exp: {
    weight: 4,
    getsBig: true,
    generate(level, avoidBig) {
      return `Math.exp(${generateSubTree(level + 1, true)} / 100)`; 
    },
  },
  multiply: {
    weight: 3,
    getsBig: false,
    generate(level, avoidBig) {
      const terms = randomRange(2, 3);
      return `(${generateSubTrees(level + 1, avoidBig, terms).join(' * ')})`;
    },
  },
  sum: {
    weight: 3,
    getsBig: false,
    generate(level, avoidBig) {
      const terms = randomRange(2, 4);
      return `(${generateSubTrees(level + 1, avoidBig, terms).join(' + ')})`;
    },
  },
  divide: {
    weight: 3,
    getsBig: false,
    generate(level, avoidBig) {
      const [numerator, divisor] = generateSubTrees(level + 1, false, 2);
      return `(${numerator} / (1 + (${divisor}) ** 2))`;
    },
  },
  tanh: {
    weight: 2,
    getsBig: false,
    generate(level, avoidBig) {
      const param = generateSubTree(level + 1, false);
      return randomCoefficient(`Math.tanh(${param})`, 1);
    },
  },
  square: {
    weight: 2,
    getsBig: true,
    generate(level, avoidBig) {
      return `Math.pow(${generateSubTree(level + 1, true)}, 2)`;
    },
  },
};
const totalBranchWeight = sum(Object.values(branchTypes).map(type => type.weight));
const totalNotBigBranchWeight = sum(Object.values(branchTypes).map(type => type.getsBig ? 0 : type.weight));

const leafTypes = {
  xy: {
    weight: 2,
    generate() { return `(${leafTypes.x.generate()} + ${leafTypes.y.generate()})`; }
  },
  x: {
    weight: 1,
    generate() { return randomCoefficient('x', 5); },
  },
  y: {
    weight: 1,
    generate() { return randomCoefficient('y', 5); },
  },
  time: {
    weight: 1,
    generate() { return randomCoefficient('time', 1); },
  },
  number: {
    weight: 1,
    generate() { return deviate(2).toFixed(2); },
  },
};
const totalLeafWeight = sum(Object.values(leafTypes).map(type => type.weight));

function generateSubTrees(level, avoidBig, n) {
  const result = [];
  for (let _ of range(n)) {
    level += 1;
    result.push(generateSubTree(level, avoidBig));
  }
  return result;
}

function generateSubTree(level, avoidBig) {
  const terminate = random(1 + level / 2) > 1;
  let nodeTypes = terminate ? leafTypes : branchTypes;
  let totalNodeWeight = terminate ? totalLeafWeight : (avoidBig ? totalNotBigBranchWeight : totalBranchWeight);

  let pick = random(totalNodeWeight);
  for (const name in nodeTypes) {
    const nodeType = nodeTypes[name];
    if (avoidBig && nodeType.getsBig) {
      continue;
    }
    pick -= nodeType.weight;
    if (pick <= 0) {
      return nodeType.generate(level, avoidBig);
    }
  }
  
  assert(false);
}

export function generateExpression() {
  return branchTypes.sum.generate(0, false);
}

