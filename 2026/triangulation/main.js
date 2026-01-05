import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';

async function main() {
  const renderLoop = startRenderLoop();

  const points = await drawPoints(renderLoop);
  await trianglulatePoints(renderLoop, points);
}

function startRenderLoop() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({pixelSize: 2});
  const hexLines = hexLinesContext.createLines();
  return {hexLines};
}

main();
