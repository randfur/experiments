const TAU = Math.PI * 2;
const tickSize = 0.01;
const gravitationalConstant = 100000;
const width = window.innerWidth;
const height = window.innerHeight;
const centreX = width / 2;
const centreY = height / 2;


async function main() {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  document.body.style = `
    background-color: white;
    padding: 0;
    margin: 0;
    overflow: hidden;
  `;
  document.body.append(canvas);

  const cameraPosition = new Vec3(0, 0, -1000);
  const cameraAngle = TAU * Math.random() * -0.25;
  const perspectiveDiv = 400;
  const sunSize = 200;
  const objects = [{
    colour: 'yellow',
    size: sunSize,
    position: new Vec3(0, 0, 0),
    velocity: new Vec3(0, 0, 0),
  }];
  for (let i = 0; i < 20; ++i) {
    const radius = sunSize + (i + 1) * (50 + Math.random() * 50);
    const angle = Math.random() * TAU;
    const yzAngle = (Math.random() * 2 - 1) * TAU * 0.05;
    const speed = Math.sqrt(sunSize * gravitationalConstant / radius);
    objects.push({
      colour: pickRandom(['red', 'brown', 'blue', 'purple', 'orange', 'black']),
      size: 10 + Math.random() * 20,
      position: new Vec3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      ).rotateYz(yzAngle),
      velocity: new Vec3(
        Math.cos(angle + TAU / 4) * speed,
        Math.sin(angle + TAU / 4) * speed,
        0,
      ).rotateYz(yzAngle),
    });
  }

  while (true) {
    await new Promise(requestAnimationFrame);

    for (let i = 0; i < objects.length; ++i) {
      const object = objects[i];
      for (let j = i + 1; j < objects.length; ++j) {
        const otherObject = objects[j];
        const delta = otherObject.position.subtract(object.position);
        const deltaLength = delta.length();
        if (deltaLength < object.size + otherObject.size) {
          // TODO: Bounce.
        } else {
          delta.scaleMut(tickSize * gravitationalConstant / deltaLength ** 3);
          object.velocity.addMut(delta.scale(otherObject.size));
          otherObject.velocity.subtractMut(delta.scale(object.size));
        }
      }
    }

    context.fillStyle = '#FFFFFF02';
    context.fillRect(0, 0, width, height);

    objects.sort((a, b) => b.position.z - a.position.z);

    for (const object of objects) {
      object.position.addMut(object.velocity.scale(tickSize));
      const screenPosition = object.position.rotateYz(cameraAngle).subtract(cameraPosition);
      if (screenPosition.z <= 0) {
        continue;
      }
      const divisor = screenPosition.z / perspectiveDiv;
      context.fillStyle = object.colour;
      context.beginPath();
      context.arc(
        centreX + screenPosition.x / divisor,
        centreY + screenPosition.y / divisor,
        object.size / divisor,
        0,
        TAU,
      );
      context.fill();
    }
  }
}

class Vec3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  subtract(other) {
    return new Vec3(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z,
    );
  }

  scale(k) {
    return new Vec3(
      this.x * k,
      this.y * k,
      this.z * k,
    );
  }

  rotateYz(angle) {
    return new Vec3(
      this.x,
      this.y * Math.cos(angle) - this.z * Math.sin(angle),
      this.y * Math.sin(angle) + this.z * Math.cos(angle),
    );
  }

  scaleMut(k) {
    this.x *= k;
    this.y *= k;
    this.z *= k;
  }

  addMut(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
  }

  subtractMut(other) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
  }

  length() {
    return (this.x ** 2 + this.y ** 2 + this.z ** 2) ** 0.5;
  }
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

main();