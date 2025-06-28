export function lerp(a, b, t) {
  return a + (b - a) * t;
}

const rotateResult = [0, 0];
export function rotate(x, y, dirX, dirY) {
  // (x + iy) * (dirX + idirY)
  // x * dirX - y * dirY + i(x * dirY + y * dirX)
  rotateResult[0] = x * dirX - y * dirY;
  rotateResult[1] = x * dirY + y * dirX;
  return rotateResult;
}

export function smooth(t) {
  return t < 0.5 ? 2 * t ** 2 : 1 - 2 * (1 - t) ** 2;
}