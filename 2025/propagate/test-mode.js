const TAU = Math.PI * 2;

export class TestMode {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.blobs = range(width * height / 10000).map(i => new Blob(i, width, height));
    this.blobs[0].side = 1;
    this.blobs[1].side = 2;

    this.backgroundImage = new OffscreenCanvas(width, height);
    const context = this.backgroundImage.getContext('2d');
    context.fillStyle = '#555';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = '#444';
    const trigScaleXx = 1414;
    const trigScaleXy = 2323;
    const trigScaleYx = 3232;
    const trigScaleYy = 4141;
    const displacement = 10;
    const step = 23;

    function displaceX(x, y) {
      return x + displacement * Math.cos(x * trigScaleXx + y * trigScaleXy);
    }

    function displaceY(x, y) {
      return y + displacement * Math.cos(x * trigScaleYx + y * trigScaleYy);
    }

    context.beginPath();
    for (let y = 0; y < height; y += step) {
      context.moveTo(displaceX(0, y), displaceY(0, y));
      for (let x = 0; x < width; x += step) {
        context.lineTo(displaceX(x, y), displaceY(x, y));
      }
    }
    context.lineWidth = 5;
    context.stroke();

    context.beginPath();
    for (let x = 0; x < width; x += step) {
      context.moveTo(displaceX(x, 0), displaceY(x, 0));
      for (let y = 0; y < height; y += step) {
        context.lineTo(displaceX(x, y), displaceY(x, y));
      }
    }
    context.lineWidth = 2;
    context.stroke();
  }

  move(x, y) {}

  click(x, y) {}

  update() {
    for (const blob of this.blobs) {
      blob.update();
    }
  }

  draw(context) {
    context.drawImage(this.backgroundImage, 0, 0);
    // for (const blob of this.blobs) {
    //   blob.draw(context);
    // }
  }
}

class Blob {
  constructor(id, mapWidth, mapHeight) {
    this.id = id;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.side = 0;
    this.size = 10 + random(50);
    this.width = this.size;
    this.height = this.size;
    this.x = random(mapWidth - this.size);
    this.y = random(mapHeight - this.size);
    const angle = random(TAU);
    const speed = 1;
    this.dx = Math.cos(angle) * speed;
    this.dy = Math.sin(angle) * speed;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x <= 0 && this.dx < 0) { this.dx *= -1; }
    if (this.y <= 0 && this.dy < 0) { this.y = 0; this.dy *= -1; }
    if (this.x + this.size >= this.mapWidth && this.dx > 0) { this.dx *= -1; }
    if (this.y + this.size >= this.mapHeight && this.dy > 0) { this.dy *= -1; }
  }

  draw(context) {
    context.fillStyle = (
      this.side == 0
      ? '#222'
      : (this.side == 1 ? 'red' : 'blue')
    );
    context.fillRect(this.x, this.y, this.size, this.size);
  }
}

class BBTree {
  constructor(breadthFactor = 5) {
    this.breadthFactor = breadthFactor;
    this.root = null;
  }

  clear() {}

  add(object) {
    if (this.root === null) {
      this.root = new BBNode(this.breadthFactor);
    }
    this.root.add(object)
  }

  // Only returns collisions with IDs greater than object's id.
  *forEachCollision(object) {
  }
}

class BBNode {
  constructor(maxChildren) {
    this.children = [];
    this.minX = null;
    this.minY = null;
    this.maxX = null;
    this.maxY = null;
    this.maxId = null;
  }
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function random(x) {
  return Math.random() * x;
}

function deviate(x) {
  return Math.random() * 2 * x - x;
}
