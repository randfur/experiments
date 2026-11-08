import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Path} from './path.js';
import {PinkSpikesStyle} from './pink-spikes-style.js';
import {Mat4} from '../../third-party/ga/src/mat4.js';
import {Rotor3} from '../../third-party/ga/src/rotor3.js';
import {Vec3} from '../../third-party/ga/src/vec3.js';

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true, pixelSize: 4});
  const hexLines = hexLinesContext.createLines();
  const path = new Path(1000, 10, [
    PinkSpikesStyle,
  ]);

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    path.progressCamera(time);
    hexLines.clear();
    path.render(hexLines, time);
    Mat4
      .setRotateRotor3(Rotor3.setConjugate(path.getPointByDistance(100).orientation))
      .translateVec3(Vec3.setScale(-1, path.start.position))
      .exportToBuffer(hexLines.transformMatrix);
    hexLines.draw();
  }
}

main();
