// @ts-check
/**
 * @typedef {import('./types.ts').PieceShape} PieceShape
 */

/**
 * @type {Array<PieceShape>}
 */
export const kPieceShapes = [{
  name: 'T',
  weight: 10,
  colour: 'grey',
  size: 3,
  orientations: [[
    '   ',
    '###',
    ' # ',
  ], [
    ' # ',
    '## ',
    ' # ',
  ], [
    ' # ',
    '###',
    '   ',
  ], [
    ' # ',
    ' ##',
    ' # ',
  ]],
}, {
  name: 'L',
  weight: 5,
  colour: 'yellow',
  size: 3,
  orientations: [[
    ' # ',
    ' # ',
    ' ##',
  ], [
    '   ',
    '###',
    '#  ',
  ], [
    '## ',
    ' # ',
    ' # ',
  ], [
    '  #',
    '###',
    '   ',
  ]],
}, {
  name: 'Backwards L',
  weight: 5,
  colour: 'purple',
  size: 3,
  orientations: [[
    ' # ',
    ' # ',
    '## ',
  ], [
    '#  ',
    '###',
    '   ',
  ], [
    ' ##',
    ' # ',
    ' # ',
  ], [
    '   ',
    '###',
    '  #',
  ]],
}, {
  name: 'Square',
  weight: 10,
  colour: 'cyan',
  size: 2,
  orientations: [[
    '##',
    '##',
  ]],
}, {
  name: 'Squiggly',
  weight: 5,
  colour: 'lime',
  size: 3,
  orientations: [[
    '   ',
    ' ##',
    '## ',
  ], [
    ' # ',
    ' ##',
    '  #',
  ]],
}, {
  name: 'Backwards Squiggly',
  weight: 5,
  colour: 'blue',
  size: 3,
  orientations: [[
    '   ',
    '## ',
    ' ##',
  ], [
    ' # ',
    '## ',
    '#  ',
  ]],
}, {
  name: 'Line',
  weight: 2,
  colour: 'red',
  size: 4,
  orientations: [[
    '  #  ',
    '  #  ',
    '  #  ',
    '  #  ',
  ], [
    '    ',
    '    ',
    '####',
    '    ',
    '    ',
  ]],
}];
