import {HexGame} from '../../third-party/hex-game/src/hex-game.js';

async function main() {
  HexGame.init({is3d: true});
  const hexLines = hexLinesContext.createLines();
  hexLines.addPoints([
    {position: {x: 0, y: 0, z: 100}, size: 10, colour: {r: 255, g: 255, b: 255}},
    {position: {x: 100, y: 0, z: 100}, size: 10, colour: {r: 255, g: 255, b: 255}},
    {position: {x: 0, y: 100, z: 100}, size: 10, colour: {r: 255, g: 255, b: 255}},
    {position: {x: 0, y: 0, z: 100}, size: 10, colour: {r: 255, g: 255, b: 255}},
  ]);
  hexLines.draw();
}

main();