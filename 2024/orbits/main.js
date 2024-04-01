const TAU = Math.PI * 2;

async function main() {
  const width = 1000;
  const height = 1000;
  const centreX = width / 2;
  const centreY = height / 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  document.body.style.backgroundColor = 'black';
  document.body.append(canvas);

  const cameraPosition = new Vec3(0, 0, -100);
  const perspectiveDiv = 40;
  const objects = [{
    colour: 'yellow',
    size: 100,
    position: new Vec3(0, 0, 0),
    velocity: new Vec3(0, 0, 0),
  }, {
    colour: 'blue',
    size: 40,
    position: new Vec3(0, 200, 0),
    velocity: new Vec3(400, 0, 0),
  }, {
    colour: 'green',
    size: 36,
    position: new Vec3(300, 0, 0),
    velocity: new Vec3(0, 40, 0),
  }, {
    colour: 'brown',
    size: 20,
    position: new Vec3(400, -200, 0),
    velocity: new Vec3(-70, 50, 0),
  }];

  const tickSize = 0.01;
  const gravitationalConstant = 100000;
  while (true) {
    await new Promise(requestAnimationFrame);

    for (let i = 0; i < objects.length; ++i) {
      const object = objects[i];
      for (let j = i + 1; j < objects.length; ++j) {
        const otherObject = objects[j];
        const delta = otherObject.position.subtract(object.position);
        delta.scaleMut(tickSize * gravitationalConstant / delta.length() ** 3);
        object.velocity.addMut(delta.scale(otherObject.size));
        otherObject.velocity.subtractMut(delta.scale(object.size));
      }
    }

    context.clearRect(0, 0, width, height);

    for (const object of objects) {
      object.position.addMut(object.velocity.scale(tickSize));
      const screenPosition = object.position.subtract(cameraPosition);
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

main();