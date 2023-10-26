import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js';

const entityList = [];

async function spawn(run) {
  const entity = {};
  entityList.push(entity);
  await run(entity);
  entityList.splice(entityList.indexOf(entity), 1);
}

async function main() {
  const {
    width,
    height,
    hexLinesContext,
  } = HexLinesContext.setupFullPageContext({
    is3d: true,
    pixelSize: 1,
  });
  const hexLines = hexLinesContext.createLines();

  while (true) {
    await new Promise(requestAnimationFrame);
    hexLines.clear();
    for (const entity of entityList) {
      entity.draw?.(hexLines);
    }
    hexLines.draw();
  }
}

main();
