const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const context = canvas.getContext('2d');

class Vec2 {
  constructor(x=0, y=0) {
    this.x = x;
    this.y = y;
  }
  
  clone() {
    return new Vec2(this.x, this.y);
  }
  
  copy(v) {
    this.x = v.x;
    this.y = v.y;
  }
  
  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    this.y = this.x * sin + this.y * cos;
    this.x = x;
  }
  
  scale(k) {
    this.x *= k;
    this.y *= k;
  }
}

function createPolygon(centre, spoke, sides) {
  const polygon = [];
  for (let i = 0; i < sides; ++i) {
    const angle = TAU * i / sides;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    polygon.push(new Vec2(
      centre.x + spoke.x * cos - spoke.y * sin,
      centre.y + spoke.x * sin + spoke.y * cos,
    ));
  }
  return polygon;
}

function pathAndRepeatPolygon(polygon, skipFirst) {
  const sides = polygon.length;

  let lastPoint = polygon[polygon.length - 1];
  context.moveTo(lastPoint.x, lastPoint.y);
  for (const point of polygon) {
    context.lineTo(point.x, point.y);
  }

  let first = true;
  for (const point of polygon) {
    if (first) {
      first = false;
      if (skipFirst) {
        lastPoint = point;
        continue;
      }
    }
    pathAdjacentMultiPolygon(
      lastPoint,
      new Vec2(
        point.x - lastPoint.x,
        point.y - lastPoint.y,
      ),
      sides - 1,
    );
    lastPoint = point;
  }
}

function pathMultiPolygon(centre, spoke, sides) {
  pathAndRepeatPolygon(createPolygon(centre, spoke, sides), /*skipFirst=*/false);
}

function pathAdjacentMultiPolygon(start, edge, sides) {
  if (sides < 3) {
    return;
  }
  
  const centreAngle = TAU / sides;
  const edgeLength = edge.length();
  const spokeLength = (edgeLength / 2) / Math.sin(centreAngle / 2);
  const edgeInnerAngle = (TAU / 2 - centreAngle) / 2;

  const spoke = edge.clone();
  spoke.scale(spokeLength / edgeLength);
  spoke.rotate(TAU / 2 - edgeInnerAngle);

  pathAndRepeatPolygon(
    createPolygon(
      new Vec2(
        start.x - spoke.x,
        start.y - spoke.y,
      ),
      spoke,
      sides,
    ),
    /*skipFirst=*/true,
  );
}

async function main() {
  canvas.width = width;
  canvas.height = height;
  context.strokeStyle = 'white';
  context.lineWidth = 3;

  context.beginPath();
  pathMultiPolygon(
    new Vec2(width / 2, height / 2),
    new Vec2(0, -Math.min(width, height) * 0.1),
    7,
  );
  context.stroke();
}

main();