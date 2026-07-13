import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Path} from './path.js';
import {PinkSpikes} from './pink-spikes.js';
import {Mat4} from '../../third-party/ga/mat4.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {Vec3} from '../../third-party/ga/vec3.js';

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true, pixelSize: 4});
  const hexLines = hexLinesContext.createLines();
  const pinkSpikes = new PinkSpikes();
  const path = new Path(1000, 10, pinkSpikes);

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    path.progress(3 + 3 * (Math.cos(time / 10000 + 2) + 2));
    hexLines.clear();
    path.render(hexLines, time);
    Mat4.multiply(
      Mat4.a.setRotateRotor3(Rotor3.conjugate(path.getPointByDistance(100).orientation)),
      Mat4.b.setTranslateVec3(Vec3.scale(-1, path.start.position)),
    ).exportToArrayBuffer(hexLines.transformMatrix);
    hexLines.draw();
  }
}

main();
