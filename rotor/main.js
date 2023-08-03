const TAU = Math.PI * 2;

/*
using Vec3 = [x, y, z];
using Bivec3 = [yz, zx, xy];
using Rot3 = [r, xy, yz, zx];
*/
function multiplyVec3Vec3(v1/*: Vec3*/, v2/*: Vec3*/)/*: Rot3*/ {
  // (ax + by + cz) * (dx + ey + fz)
  // = adxx + aexy + afxz + bdyx + beyy + bfyz + cdzx + cezy + cfzz
  // = ad + aexy + afxz + bdyx + be + bfyz + cdzx + cezy + cf
  // = (ad + be + cf) + (ae - bd)xy + (bf - ce)yz + (-af + cd)zx
  // = g + hxy + iyz + jzx
  const [a, b, c] = v1;
  const [d, e, f] = v2;
  return [
    a * d + b * e + c * f,
    a * e - b * d,
    b * f - c * e,
    -a * f + c * d,
  ];
}

function wedgeVec3Vec3(a/*: Vec3*/, b/*: Vec3*/)/*: Bivec3*/ {
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;
  return [
    ay * bz - az * by, // x yz
    az * bx - ax * bz, // y zx
    ax * by - ay * bx, // z xy
  ];
}

function bivec3FromAxis(axis/*: Vec3*/)/*: Bivec3*/ {
  // Treat x, y, z basis vectors in axis as normals and reinterpret_cast them as their corresponding planes:
  // x -> yz
  // y -> zx
  // z -> xy
  // The order of elements in Bivec3 have been arranged to match Vec3 for this cast.
  return axis;
}

function rot3FromBivec3Angle(bv/*: Bivec3*/, angle/*: radians*/)/*: Rot3*/ {
  const [yz, zx, xy] = bv;
  const k = Math.sin(angle / 2);
  // Real component is no rotation.
  // Bivec3 component is planar rotation.
  // Weigh them proportionally according to angle / 2.
  // Use angle / 2 due to the double planar rotation in rotateVec3() that's used to cancel out the trivector extrusion.
  return [
    Math.cos(angle / 2),
    k * xy,
    k * yz,
    k * zx,
  ];
}

function rotateVec3(v/*: Vec3*/, r/*: Rot3*/)/*: Vec3*/ {
  const [a, b, c] = v;
  const [d, e, f, g] = r;
  // (d - exy - fyz - gzx) * (ax + by + cz) * (d + exy + fyz + gzx)
  // = (dax + dby + dcz - eaxyx - ebxyy - ecxyz - fayzx - fbyzy - fcyzz - gazxx - gbzxy - gczxz) * (d + exy + fyz + gzx)
  // = (dax + dby + dcz + eay - ebx - ecxyz - faxyz + fbz - fcy - gaz - gbxyz + gcx) * (d + exy + fyz + gzx)
  // = ((da - eb + gc)x + (db + ea - fc)y + (dc + fb - ga)z + (-ec - fa - gb)xyz) * (d + exy + fyz + gzx)
  // = (hx + iy + jz + kxyz) * (d + exy + fyz + gzx)
  const [h, i, j, k] = [
    d * a - e * b + g * c,
    d * b + e * a - f * c,
    d * c + f * b - g * a,
    -e * c - f * a - g * b,
  ];
  // = (hdx + hexxy + hfxyz + hgxzx + idy + ieyxy + ifyyz + igyzx + jdz + jezxy + jfzyz + jgzzx + kdxyz + kexyzxy + kfxyzyz + kgxyzzx)
  // = (hdx + hey + hfxyz - hgz + idy - iex + ifz + igxyz + jdz + jexyz - jfy + jgx + kdxyz - kez - kfx - kgy)
  // = (hd - ie + jg - kf)x + (he + id - jf - kg)y + (-hg + if + jd - ke)z + (hf + ig + je + kd)xyz
  // = rx + sy + tz + uxyz
  console.assert((h * f + i * g + j * e + k * d) < 1e-6);
  return [
    h * d - i * e + j * g - k * f,
    h * e + i * d - j * f - k * g,
    -h * g + i * f + j * d - k * e,
  ];
}

function multiplyRot3Rot3(r1/*: Rot3*/, r2/*: Rot3*/)/*: Rot3*/ {
  const [a, b, c, d] = r1;
  const [e, f, g, h] = r2;
  // (a + bxy + cyz + dzx) * (e + fxy + gyz + hzx)
  // = ae + afxy + agyz + ahzx + bexy + bfxyxy + bgxyyz + bhxyzx + ceyz + cfyzxy + cgyzyz + chyzzx + dezx + dfzxxy + dgzxyz + dhzxzx
  // = ae + afxy + agyz + ahzx + bexy - bf - bgzx + bhyz + ceyz + cfzx - cg - chxy + dezx - dfyz + dgxy - dh
  // = (ae - bf - cg - dh) + (af + be - ch + dg)xy + (ag + bh + ce - df)yz + (ah - bg + cf + de)zx
  return [
    a * e - b * f - c * g - d * h,
    a * f + b * e - c * h + d * g,
    a * g + b * h + c * e - d * f,
    a * h - b * g + c * f + d * e,
  ];
}

console.log(
  rotateVec3(
    [1, 2, 3],
    multiplyRot3Rot3(
      multiplyVec3Vec3(
        [1, 0, 0],
        [Math.SQRT1_2, Math.SQRT1_2, 0],
      ),
      multiplyVec3Vec3(
        [0, 1, 0],
        [0, Math.SQRT1_2, Math.SQRT1_2],
      ),
    )
  )
);
console.log(
  rotateVec3(
    rotateVec3(
      [1, 2, 3],
      multiplyVec3Vec3(
        [1, 0, 0],
        [Math.SQRT1_2, Math.SQRT1_2, 0],
      ),
    ),
    multiplyVec3Vec3(
      [0, 1, 0],
      [0, Math.SQRT1_2, Math.SQRT1_2],
    ),
  )
);
console.log(
  rotateVec3(
    [1, 2, 3],
    multiplyRot3Rot3(
      rot3FromBivec3Angle(
        bivec3FromAxis([0, 0, 1]),
        TAU / 4,
      ),
      rot3FromBivec3Angle(
        bivec3FromAxis([1, 0, 0]),
        TAU / 4,
      ),
    )
  )
);
