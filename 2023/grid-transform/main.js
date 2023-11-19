import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js';
import {Temp} from './third-party/ga/temp.js';
import {Vec3} from './third-party/ga/vec3.js';
import {Rotor3} from './third-party/ga/rotor3.js';

async function main() {
  const {width, height, hexLinesContext} = HexLinesContext.setupFullPageContext({
    is3d: true,
    pixelSize: 1,
  });
  const hexLines = hexLinesContext.createLines();

  const position = new Vec3();
  const orientation = new Rotor3();
  const dragState = {};
  window.addEventListener('contextmenu', event => event.preventDefault());
  window.addEventListener('pointerdown', event => {
    event.preventDefault();
    dragState[event.button] = {
      x: event.offsetX,
      y: event.offsetY,
    };
  });
  window.addEventListener('pointermove', event => {
    const x = event.offsetX;
    const y = event.offsetY;
    for (const [button, lastPosition] of Object.entries(dragState)) {
      const deltaX = x - lastPosition.x;
      const deltaY = y - lastPosition.y;
      lastPosition.x = x;
      lastPosition.y = y;
      switch (button) {
      case '0':
        orientation.inplaceMultiplyRight(
          Temp.rotor3().setVec3ToVec3(
            Temp.vec3(0, 0, 1).inplaceRotateRotor(orientation),
            Temp.vec3(-deltaX, deltaY, 1000).inplaceRotateRotor(orientation),
          )
        );
        break;
      case '1':
        position.inplaceAdd(
          Temp.vec3(0, 0, deltaY).inplaceScale(0.8).inplaceRotateRotor(orientation)
        );
        break;
      case '2':
        position.inplaceAdd(
          Temp.vec3(-deltaX, deltaY, 0).inplaceScale(0.2).inplaceRotateRotor(orientation)
        );
        break;
      }
    }
  });
  window.addEventListener('pointerup', event => {
    delete dragState[event.button];
  });

  while (true) {
    await new Promise(requestAnimationFrame);
    camera(hexLines, position, orientation);
    draw(hexLines);
  }
}

function camera(hexLines, position, orientation) {
  Temp.mat4()
    .setTranslateVec3(
      Temp.vec3().setScale(-1, position)
    )
    .inplaceMultiplyLeft(
      Temp.mat4().setRotateRotor(
        Temp.rotor3().setConjugate(orientation)
      )
    )
    .exportToArrayBuffer(hexLines.transformMatrix);
}

function draw(hexLines) {
  hexLines.clear();
  const size = 240;
  const step = 20;
  for (let x = -size; x <= size; x += step) {
    for (let y = -size; y <= size; y += step) {
      for (let z = -size; z <= size; z += step) {
        const noX = x === 0;
        const noY = y === 0;
        const noZ = z === 0;
        const noCount = noX + noY + noZ;
        hexLines.addDot({
          position: {x, y, z},
          size: noCount > 0 ? 3 : 2,
          colour: noCount === 3 ? {
            r: 255,
            g: 255,
            b: 255,
          } : (noCount === 2 ? {
            r: noY && noZ ? (x > 0 ? 255 : 100) : 0,
            g: noZ && noX ? (y > 0 ? 255 : 100) : 0,
            b: noX && noY ? (z > 0 ? 255 : 100) : 0,
          } : {
            r: Math.abs(x),
            g: Math.abs(y),
            b: Math.abs(z),
          }),
        });
      }
    }
  }
  hexLines.draw();
}

main();