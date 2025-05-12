import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js';
import {createIdentityMatrix} from './third-party/hex-lines/src/utils.js';

async function main() {
  const {width, height, canvas, hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});

  const hexLines = hexLinesContext.createLines();

  function generateTriangles() {
    hexLines.clear();
    const triangleHalfDirection = setLength({x: 1, y: deviate(1), z: deviate(1)}, 1);
    for (let i = 0; i < 300; ++i) {
      addTriangle({
        hexLines,
        direction: {x: deviate(1), y: deviate(1), z: deviate(1)},
        radius: 100,
        triangleHalfDirection,
      });
    }
  }
  generateTriangles();

  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener('pointermove', event => {
    pointerX = (event.offsetX - (canvas.width / 2)) / 80;
    pointerY = (event.offsetY - (canvas.height / 2)) / 80;
  });

  window.addEventListener('click', event => {
    generateTriangles();
  });

  while (true) {
    await new Promise(requestAnimationFrame);
    hexLinesContext.transformMatrix = multiplyMatrices(
      rotateYMatrix(-pointerX),
      rotateXMatrix(-pointerY),
    );
    hexLinesContext.transformMatrix[14] = 200;
    hexLines.draw();
  }
}

function addTriangle({hexLines, direction, radius, triangleHalfDirection}) {
  const trianglePoints = [
    {position: {x: 0, y: -10, z: 10}, colour: {r: 255, g: 0, b: 0}, size: 2},
    {position: {x: 0, y: -10, z: -10}, colour: {r: 0, g: 255, b: 0}, size: 2},
    {position: {x: 0, y: 10, z: 0}, colour: {r: 0, g: 0, b: 255}, size: 2},
    {position: {x: 0, y: -10, z: 10}, colour: {r: 255, g: 0, b: 0}, size: 2},
  ];

  const sphereHalfDirection = setLength(add({x: 1, y: 0, z: 0}, setLength(direction, 1)), 1);

  hexLines.addPoints([
    ...trianglePoints.map(({position, colour, size}) => ({
      position: add(
        rotateTo(
          rotateTo(position, triangleHalfDirection),
          sphereHalfDirection,
        ),
        setLength(direction, radius),
      ),
      colour,
      size,
    })),
    null,
  ]);
}

function add(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
}

function setLength(v, length) {
  const currentLength = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  const scale = length / currentLength;
  return {
    x: v.x * scale,
    y: v.y * scale,
    z: v.z * scale,
  };
}

function rotateTo(v, halfDirection) {
  const {x: a, y: b, z: c} = halfDirection;
  const {x: d, y: e, z: f} = v;
  // r = x * (ax + by + cz)
  //   = a + bxy - czx
  // p = dx + ey + fz
  //
  // result = conjugate(r) * p * r
  // = (a - bxy + czx) * (dx + ey + fz) * (a + bxy - czx)
  // = (adx + aey + afz - bdxyx - bexyy - bfxyz + cdzxx + cezxy + cfzxz) * (a + bxy - czx)
  // = (
  //     aadx + aaey + aafz - abdxyx - abexyy - abfxyz + acdzxx + acezxy + acfzxz +
  //     abdxxy + abeyxy + abfzxy - bbdxyxxy - bbexyyxy - bbfxyzxy + bcdzxxxy + bcezxyxy + bcfzxzxy +
  //     -acdxzx - aceyzx - acfzzx + bcdxyxzx + bcexyyzx + bcfxyzzx - ccdzxxzx - ccezxyzx - ccfzxzzx
  //   )
  // = (
  //     aadx + aaey + aafz + abdy - abex - abfxyz + acdz + acexyz - acfx +
  //     abdy - abex + abfxyz - bbdx - bbey + bbfz + bcdxyz - bcez - bcfy +
  //     acdz - acexyz - acfx - bcdxyz - bcez - bcfy - ccdx + ccey - ccfz
  //   )
  // = (aad - 2abe - 2acf - bbd - ccd)x +
  //   (aae + 2abd - 2bcf - bbe + cce)y +
  //   (aaf + 2acd - 2bce + bbf - ccf)z

  return {
    x: a*a*d - 2*a*b*e - 2*a*c*f - b*b*d - c*c*d,
    y: a*a*e + 2*a*b*d - 2*b*c*f - b*b*e + c*c*e,
    z: a*a*f + 2*a*c*d - 2*b*c*e + b*b*f - c*c*f,
  };
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function coinFlip() {
  return Math.random() < 0.5;
}

function rotateXMatrix(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1,
  ]);
}

function rotateYMatrix(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1,
  ]);
}

function rotateZMatrix(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([
    c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function multiplyMatrices(a, b) {
  const [
    aa, ab, ac, ad,
    ba, bb, bc, bd,
    ca, cb, cc, cd,
    da, db, dc, dd,
  ] = a;
  const [
    ee, ef, eg, eh,
    fe, ff, fg, fh,
    ge, gf, gg, gh,
    he, hf, hg, hh,
  ] = b;

  return new Float32Array([
    aa*ee + ab*fe + ac*ge + ad*he, aa*ef + ab*ff + ac*gf + ad*hf, aa*eg + ab*fg + ac*gg + ad*hg, aa*eh + ab*fh + ac*gh + ad*hh,
    ba*ee + bb*fe + bc*ge + bd*he, ba*ef + bb*ff + bc*gf + bd*hf, ba*eg + bb*fg + bc*gg + bd*hg, ba*eh + bb*fh + bc*gh + bd*hh,
    ca*ee + cb*fe + cc*ge + cd*he, ca*ef + cb*ff + cc*gf + cd*hf, ca*eg + cb*fg + cc*gg + cd*hg, ca*eh + cb*fh + cc*gh + cd*hh,
    da*ee + db*fe + dc*ge + dd*he, da*ef + db*ff + dc*gf + dd*hf, da*eg + db*fg + dc*gg + dd*hg, da*eh + db*fh + dc*gh + dd*hh,
  ]);
}

main();