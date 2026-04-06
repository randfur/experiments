import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

let particles = [];

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  particles = range(100).map(i => ({
    position: new Vec3(),
    transpose: new Vec3(deviate(100), deviate(100), deviate(100)),
    rotation: new Rotor3(deviate(1), deviate(1), deviate(1), deviate(1)).inplaceNormalise(),
  }));

  while (true) {
    await new Promise(requestAnimationFrame);

    hexLines.clear();
    for (const particle of particles) {
      // particle.position.inplaceAdd(Vec3.set(
      hexLines.addPoint({
        position: Vec3.addXyz(particle.position, 0, 0, 100),
        size: 10,
        colour: {
          r: colourChannelWrap(particle.transpose.x),
          g: colourChannelWrap(particle.transpose.y),
          b: colourChannelWrap(particle.transpose.z),
        },
      });
    }
    hexLines.draw();
  }
}

function colourChannelWrap(x) {
  return ((x % 255) + 255) % 255;
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function deviate(x) {
  return Math.random() * x * 2 - x;
}

main();