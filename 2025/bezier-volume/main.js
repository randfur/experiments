import {HexLinesContext} from '../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../third-party/ga/vec3.js';
import {Temp} from '../third-party/ga/temp.js';

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const bezierVolume = new BezierVolume();

  const fishes = range(20).map(i => {
    const pants = deviate(100);
    const depth = deviate(50);
    return [
      new Vec3(pants + 2, -50 + i * 5 + 6, depth),
      new Vec3(pants + 5, -50 + i * 5 + 4, depth),
      new Vec3(pants + 8, -50 + i * 5 + 3, depth),
      new Vec3(pants + 7, -50 + i * 5 + 5, depth),
      new Vec3(pants + 9, -50 + i * 5 + 4, depth),
      new Vec3(pants + 9, -50 + i * 5 + 8, depth),
      new Vec3(pants + 7, -50 + i * 5 + 6, depth),
      new Vec3(pants + 9, -50 + i * 5 + 9, depth),
      new Vec3(pants + 5, -50 + i * 5 + 8, depth),
      new Vec3(pants + 2, -50 + i * 5 + 6, depth),
    ];
  });

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Temp.reclaimAll();

    // TODO everytihng.

    hexLines.clear();
    bezierVolume.draw(hexLines);

    for (let i = 0; i < fishes.length; ++i) {
      const fish = fishes[i];
      hexLines.addPoints(fish.map(position => ({
        position: Vec3.temp().setAddXyz(
          position,
          Math.cos(time / 10000) * 100,
          0,
          100 + Math.cos(time / 1000 + i) * 10,
        ),
        size: 1,
        colour: {r: 255, g: 255, b: 255},
      })));
      hexLines.addNull();
    }

    hexLines.draw();
  }
}

class BezierVolume {
  constructor() {
    this.scaffolding = range(4).map(x =>
      range(4).map(z =>
        new Bezier(
          range(4).map(y =>
            new Vec3(x, y, z)
              .inplaceAddXyz(-1.5, -1.5, 2)
              .inplaceScale(30)
              .inplaceAddXyz(deviate(10), deviate(10), deviate(10))
          )
        )
      )
    );
  }

  draw(hexLines) {
    for (const row of this.scaffolding) {
      for (const bezier of row) {
        bezier.draw(hexLines);
      }
    }

    // Draw base surface.
    //
  }
}

class Bezier {
  constructor(controlPoints) {
    this.controlPoints = controlPoints;
  }

  evaluate(t, output) {
    const [a, b, c, d] = this.controlPoints;

    const e = Vec3.temp().setLerp(a, b, t);
    const f = Vec3.temp().setLerp(b, c, t);
    const g = Vec3.temp().setLerp(c, d, t);

    const h = Vec3.temp().setLerp(e, f, t);
    const i = Vec3.temp().setLerp(f, g, t);

    return output.setLerp(h, i, t);
  }

  draw(hexLines) {
    // for (let i = 0; i < this.controlPoints.length; ++i) {
    //   const point = this.controlPoints[i];
    //   hexLines.addDot({position: point, size: 10, colour: {r: 255 * (i + 1) / 4}});
    // }

    const count = 100;
    for (let i = 0; i < count; ++i) {
      const position = Vec3.temp();
      this.evaluate(i / count, position);
      hexLines.addDot({position, size: 2 + deviate(0.2), colour: {g: 255 * (i + 1) / count}});
    }
    hexLines.addNull();
  }
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

main();