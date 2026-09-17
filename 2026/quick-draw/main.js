import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';

async function main() {
  const {hexLinesContext, width, height} = HexLinesContext.setupFullPageContext({
    is3d: false,
    enableContextMenu: false,
  });
  const hexLines = hexLinesContext.createLines();

  let points = [];
  const deleteRadius = 20;
  const pointerPosition = new Vec3();
  const boxSize = Math.min(width, height) / 4;

  window.addEventListener('pointermove', event => {
    pointerPosition.setXyz(event.clientX - width / 2, height / 2 - event.clientY);
  });

  window.addEventListener('pointerdown', event => {
    switch (event.button) {
    case 0:
      points.push(pointerPosition.clone());
      break;
    case 1:
      points.push(null);
      break;
    case 2:
      if (points.length > 0) {
        if (points[points.length - 1] === null) {
          points.splice(points.length - 1, 1);
        } else {
          points = points.filter(point => point === null || Vec3.delta(pointerPosition, point).length() > deleteRadius);
        }
      }
      break;
    }
    console.log(`[\n${
      points.map(point => {
        if (point === null) {
          return '  null,\n';
        }
        const scaledPoint = Vec3.scale(1 / boxSize, point);
        return `  new Vec3(${scaledPoint.x.toFixed(2)}, ${scaledPoint.y.toFixed(2)}),\n`;
      }).join('')
    }]`);
  });

  while (true) {
    await new Promise(requestAnimationFrame);
    hexLines.clear();
    for (const point of points) {
      if (point === null) {
        hexLines.addNull();
      } else {
        hexLines.addPoint({
          position: point,
          size: 4,
          colour: {r: 20, g: 50, b: 255},
        });
      }
    }
    hexLines.addNull();

    for (const point of points) {
      if (point !== null) {
        hexLines.addDot({
          position: point,
          size: deleteRadius,
          colour: {r: 255, g: 20, b: 50},
        });
      }
    }

    const white = {r: 255, g: 255, b: 255};
    hexLines.addPoints([
      {position: new Vec3(-boxSize, -boxSize), size: 3, colour: white},
      {position: new Vec3(boxSize, -boxSize), size: 3, colour: white},
      {position: new Vec3(boxSize, boxSize), size: 3, colour: white},
      {position: new Vec3(-boxSize, boxSize), size: 3, colour: white},
      {position: new Vec3(-boxSize, -boxSize), size: 3, colour: white},
      null,
      {position: new Vec3(-width, 0), size: 1, colour: white},
      {position: new Vec3(width, 0), size: 1, colour: white},
      null,
      {position: new Vec3(0, -height), size: 1, colour: white},
      {position: new Vec3(0, height), size: 1, colour: white},
      null,
    ]);

    const spokes = 50;
    for (let i = 0; i <= spokes; ++i) {
      hexLines.addPoint({
        position: new Vec3().setPolar(Math.PI * 2 * i / spokes, boxSize),
        size: 3,
        colour: white,
      });
    }
    hexLines.addNull();

    hexLines.draw();
  }
}

main();
