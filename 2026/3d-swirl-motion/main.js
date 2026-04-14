import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Swirly} from './swirly.js';
import {Box} from './box.js';
import {Mouse} from './mouse.js';
import {random, range} from './utils.js';

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();
  const mouse = new Mouse();
  const mouseScale = 0.3;
  const targetPosition = new Vec3();
  const targetSwirly = new Swirly({
    startPosition: new Vec3(0, 0, -50),
    randomTranspose: new Vec3(),
    randomScale: (1 + random(1)) / 100,
    randomSpeed: (1 + random(1)) / 4,
    targetPosition: new Vec3(),
    targetPull: 0,
  });
  const boxes = range(100).map(i => new Box(targetSwirly.position, mouse));

  while (true) {
    await new Promise(requestAnimationFrame);

    if (mouse.down) {
      targetSwirly.targetPosition.setXyz(
        mouse.x * mouseScale,
        mouse.y * mouseScale,
        Math.max(0, 600 - (Math.abs(mouse.x) + Math.abs(mouse.y)) * 0.8),
      );
    } else {
      targetSwirly.targetPosition.inplaceFractionTowards(Vec3.xyz(0, 0, 150), 0.01);
    }
    targetSwirly.targetPull = mouse.down ? 0.01 : 0.001;

    hexLines.clear();
    targetSwirly.update();
    for (const box of boxes) {
      box.update();
      box.draw(hexLines);
    }
    hexLines.draw();
  }
}
main();