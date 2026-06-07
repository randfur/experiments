import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();
  const path = new Path();
  const camera = new Camera(path);

  while (true) {
    await new Promise(requestAnimationFrame);
    path.progress(10);
    hexLines.clear();
    path.render(hexLines, 1000);
    camera.setTransform(hexLines.transformMatrix);
    hexLines.draw();
  }
}

class Path {
}

class Step {
  constructor(distance, position, orientation) {
  }
}

class Camera {
}

main();