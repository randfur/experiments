import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});

  const hexLines = hexLinesContext.createLines();

  const bones = range(10).map(i => ({
    length: 100,
    position: new Vec3(deviate(1), deviate(1), 400 + deviate(1)),
    orientation: new Rotor3(deviate(1), deviate(1), deviate(1), deviate(1)).inplaceNormalise(),
  }));

  let last = null;
  for (const bone of bones) {
    if (last !== null) {
      bone.position.set(last);
    }
    last = endPosition(bone);
  }

  for (const bone of bones) {
    hexLines.addPoints([{
      position: bone.position,
      size: 10,
      colour: {r: 255, g: 255, b: 255},
    }, {
      position: endPosition(bone),
      size: 10,
      colour: {r: 255, g: 255, b: 255},
    }]);
  }

  hexLines.draw();
}

function endPosition(bone) {
  return Vec3.x(bone.length).inplaceRotateRotor(bone.orientation).inplaceAdd(bone.position);
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function deviate(x) {
  return Math.random() * 2 * x - x;
}

main();
