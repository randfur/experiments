import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  hexLines.addPoints([
    {position: {x: 0, y: 0, z: 20}, size: 10, colour: {r: 255, g: 255, b: 255}},
    {position: {x: 10, y: 0, z: 100}, size: 10, colour: {r: 255, g: 255, b: 255}},
  ]);
  while (true) {
    await new Promise(requestAnimationFrame);
    hexLines.draw();
  }
}

main();