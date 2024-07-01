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

function getChannelFactor(type, sourceChannelValue, sourceAlpha, destinationChannelValue, destinationAlpha) {
  switch (type) {
  case ZERO:
    return 0;
  case ONE:
    return 1;
  case SRC_COLOR:
    return sourceChannelValue;
  case ONE_MINUS_SRC_COLOR:
    return 1 - sourceChannelValue;
  case DST_COLOR:
    return destinationChannelValue;
  case ONE_MINUS_DST_COLOR:
    return 1 - destinationChannelValue;
  case SRC_ALPHA:
    return sourceAlpha;
  case ONE_MINUS_SRC_ALPHA:
    return 1 - sourceAlpha;
  case DST_ALPHA:
    return destinationAlpha;
  case ONE_MINUS_DST_ALPHA:
    return 1 - destinationAlpha;
  case SRC_ALPHA_SATURATE:
    return Math.min(sourceAlpha, 1 - destinationAlpha);
  }
}

function getAlphaFactor(type, sourceAlpha, destinationAlpha) {
  switch (type) {
  case ZERO:
    return 0;
  case ONE:
    return 1;
  case SRC_COLOR:
    return sourceAlpha;
  case ONE_MINUS_SRC_COLOR:
    return 1 - sourceAlpha;
  case DST_COLOR:
    return destinationAlpha;
  case ONE_MINUS_DST_COLOR:
    return 1 - destinationAlpha;
  case SRC_ALPHA:
    return sourceAlpha;
  case ONE_MINUS_SRC_ALPHA:
    return 1 - sourceAlpha;
  case DST_ALPHA:
    return destinationAlpha;
  case ONE_MINUS_DST_ALPHA:
    return 1 - destinationAlpha;
  case SRC_ALPHA_SATURATE:
    return 1;
  }
}

function getTypeString(type) {
  switch (type) {
  case ZERO:
    return 'ZERO';
  case ONE:
    return 'ONE';
  case SRC_COLOR:
    return 'SRC_COLOR';
  case ONE_MINUS_SRC_COLOR:
    return 'ONE_MINUS_SRC_COLOR';
  case DST_COLOR:
    return 'DST_COLOR';
  case ONE_MINUS_DST_COLOR:
    return 'ONE_MINUS_DST_COLOR';
  case SRC_ALPHA:
    return 'SRC_ALPHA';
  case ONE_MINUS_SRC_ALPHA:
    return 'ONE_MINUS_SRC_ALPHA';
  case DST_ALPHA:
    return 'DST_ALPHA';
  case ONE_MINUS_DST_ALPHA:
    return 'ONE_MINUS_DST_ALPHA';
  case SRC_ALPHA_SATURATE:
    return 'SRC_ALPHA_SATURATE';
  }
}

function typeCombinationToString(typeCombination) {
  return {
    srcRGB: getTypeString(typeCombination[0]),
    dstRGB: getTypeString(typeCombination[1]),
    srcAlpha: getTypeString(typeCombination[2]),
    dstAlpha: getTypeString(typeCombination[3]),
  };
}

function colourToHex(colour) {
  return '#' + colour.map(x => Math.floor(x * 255).toString(16).padStart(2, 0)).join('');
}

function clamp(value) {
  return Math.min(1, Math.max(0, value));
}

function getDistance(colourA, colourB) {
  return (
    Math.abs(colourA[0] - colourB[0]) +
    Math.abs(colourA[1] - colourB[1]) +
    Math.abs(colourA[2] - colourB[2]) +
    Math.abs(colourA[3] - colourB[3])
  );
}

function blendColours(typeCombination, sourceColour, destinationColour) {
  return [
    clamp(
      sourceColour[0] * getChannelFactor(
        typeCombination[0],
        sourceColour[0],
        sourceColour[3],
        destinationColour[0],
        destinationColour[3],
      ) +
      destinationColour[0] * getChannelFactor(
        typeCombination[1],
        sourceColour[0],
        sourceColour[3],
        destinationColour[0],
        destinationColour[3],
      ),
    ),

    clamp(
      sourceColour[1] * getChannelFactor(
        typeCombination[0],
        sourceColour[1],
        sourceColour[3],
        destinationColour[1],
        destinationColour[3],
      ) +
      destinationColour[1] * getChannelFactor(
        typeCombination[1],
        sourceColour[1],
        sourceColour[3],
        destinationColour[1],
        destinationColour[3],
      ),
    ),

    clamp(
      sourceColour[2] * getChannelFactor(
        typeCombination[0],
        sourceColour[2],
        sourceColour[3],
        destinationColour[2],
        destinationColour[3],
      ) +
      destinationColour[2] * getChannelFactor(
        typeCombination[1],
        sourceColour[2],
        sourceColour[3],
        destinationColour[2],
        destinationColour[3],
      ),
    ),

    clamp(
      sourceColour[3] * getAlphaFactor(
        typeCombination[2],
        sourceColour[3],
        destinationColour[3],
      ) +
      destinationColour[3] * getAlphaFactor(
        typeCombination[3],
        sourceColour[3],
        destinationColour[3],
      ),
    ),
  ];
}

// function premultiply(colour) {
//   colour[0] *= colour[3];
//   colour[1] *= colour[3];
//   colour[2] *= colour[3];
// }

async function main() {
  const destinationColour = [0, 0, 1, 0.25];
  const sourceColour = [1, 0, 0, 0.75];
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  const context = canvas.getContext('2d');
  context.fillStyle = colourToHex(destinationColour);
  context.fillRect(0, 0, 100, 100);
  context.fillStyle = colourToHex(sourceColour);
  context.fillRect(0, 0, 100, 100);
  const targetColour = Array.from(context.getImageData(0, 0, 1, 1).data).map(x => x / 255);

  // premultiply(sourceColour);

  const typeCombinations = getCombinations(types, 4);

  let bestDistance = Infinity;
  let bestTypeCombination = null;
  let bestBlendedColour = null;

  for (const typeCombination of typeCombinations) {
    const blendedColour = blendColours(typeCombination, sourceColour, destinationColour);
    const distance = getDistance(targetColour, blendedColour);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestTypeCombination = typeCombination;
      bestBlendedColour = blendedColour;
    }
  }

  console.log('sourceColour', sourceColour);
  console.log('destinationColour', destinationColour);
  console.log('targetColour', targetColour);
  console.log('bestBlendedColour', bestBlendedColour);
  console.log('bestDistance', bestDistance);
  console.log('bestTypeCombination', typeCombinationToString(bestTypeCombination));
}

main();
