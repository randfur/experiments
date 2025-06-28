export const TAU = Math.PI * 2;

export const kLeftButton = 0;
export const kMiddleButton = 1;
export const kRightButton = 2;

export function withinAngles(x, y, angleA, angleB) {
  console.assert(Math.abs(angleB - angleA) < TAU / 2);

  const ax = Math.cos(angleA);
  const ay = Math.sin(angleA);
  const bx = Math.cos(angleB);
  const by = Math.sin(angleB);
  /*
    [ax bx][a] = [x]
    [ay by][b]   [y]
    
    [a] = [ax bx]^-1[x]
    [b]   [ay by]   [y]
    
    [a] = [by  -bx][x] / (ax * by - bx * ay)
    [b]   [-ay  ax][y]
  */
  const det = ax * by - bx * ay;
  const a = (by * x - bx * y) / det;
  const b = (-ay * x + ax * y) / det;
  return a >= 0 && b >= 0;
}

console.assert(withinAngles(1, 1, 0, TAU / 4));
console.assert(!withinAngles(-1, 1, 0, TAU / 4));
console.assert(withinAngles(-1, 1, TAU / 4, TAU / 2));