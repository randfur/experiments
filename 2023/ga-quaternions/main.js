const TAU = Math.PI * 2;
function main() {
  const x = [1, 0, 0];
  const y = [0, 1, 0];
  const z = [0, 0, 1];
  console.log(rotate(y, rotorFromAxisAngle(x, TAU / 4)));
  console.log(rotate(z, rotorFromAxisAngle(y, TAU / 4)));
  console.log(rotate(x, rotorFromAxisAngle(z, TAU / 4)));
}

function rotorFromVectorToVector(v1, v2) {
  const [a, b, c] = normaliseVector(v1);
  const [d, e, f] = normaliseVector(addVectors(v1, v2));
  // (ax + by + cz) * (dx + ey + fz)
  // = adxx + aexy + afxx +
  //   bdyx + beyy + bfyx +
  //   cdzx + cezy + cfzx
  // = ad + aexy + -afzx +
  //   -bdxy + be + bfyz +
  //   cdzx + -ceyz + cf
  // = (ad + be + cf) + (bf - ce)yz + (cd - af)zx + (ae - bd)xy
  return [
    a * d + b * e + c * f,
    b * f - c * e,
    c * d - a * f,
    a * e - b * d,
  ];
}

function rotate(vector, rotor) {
  return rotorToVector(
    rotorMultiply(
      rotorMultiply(
        rotorConjugate(rotor),
        vectorToRotor(vector),
      ),
      rotor,
    )
  );
}

function rotorMultiply(r1, r2) {
  const [a, b, c, d] = r1;
  const [e, f, g, h] = r2;
  // r = 1
  // (arr + byz + czx + dxy) * (err + fyz + gzx + hxy)
  // = aerrrr + afrryz + agrrzx + ahrrxy +
  //   beyzrr + bfyzyz + bgyzzx + bhyzxy +
  //   cezxrr + cfzxyz + cgzxzx + chzxxy +
  //   dexyrr + dfxyyz + dgxyzx + dhxyxy
  // = aerr + afyz + agzx + ahxy +
  //   beyz + bfyzyz + bgyx + bhzx +
  //   cezx + cfxy + cgzxzx + chzy +
  //   dexy + dfxz + dgyz + dhxyxy
  // = aerr + afyz + agzx + ahxy +
  //   beyz + -bfrr + -bgxy + bhzx +
  //   cezx + cfxy + -cgrr + -chyz +
  //   dexy + -dfzx + dgyz + -dhrr
  // = (ae - bf - cg - dh)rr +
  //   (af + be - ch + dg)yz +
  //   (ag + bh + ce - df)zx +
  //   (ah - bg + cf + de)xy
  return [
    a * e - b * f - c * g - d * h,
    a * f + b * e - c * h + d * g,
    a * g + b * h + c * e - d * f,
    a * h - b * g + c * f + d * e,
  ];
}

function rotorConjugate([r, yz, zx, xy]) {
  return [r, -yz, -zx, -xy];
}

function vectorToRotor([x, y, z]) {
  return [0, x, y, z];
}

function rotorToVector([r, x, y, z]) {
  return [x, y, z];
}

function rotateX([x, y, z], angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    x,
    cos * y + sin * z,
    -sin * y + cos * z,
  ];
}

function rotateY([x, y, z], angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    -sin * z + cos * x,
    y,
    cos * z + sin * x,
  ];
}

function normaliseVector(v) {
  const [x, y, z] = v;
  const length = lengthOfVector(v);
  return [
    x / length,
    y / length,
    z / length,
  ];
}

function addVectors([a, b, c], [d, e, f]) {
  return [
    a + d,
    b + e,
    c + f,
  ];
}

function lengthOfVector([x, y, z]) {
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}

function rotorFromAxisAngle(axis, angle) {
  const [x, y, z] = normaliseVector(axis);
  const sin = Math.sin(angle / 2);
  return [Math.cos(angle / 2), sin * x, sin * y, sin * z];
}

main();