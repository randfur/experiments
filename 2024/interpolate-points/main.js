class Vec2 {
  constructor(x=0, y=0) {
    this.set(x, y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(other) {
    this.set(other.x, other.y);
    return this;
  }

  add(other) {
    return new Vec2(
      this.x + other.x,
      this.y + other.y,
    );
  }

  subtract(other) {
    return new Vec2(
      this.x - other.x,
      this.y - other.y,
    );
  }

  scale(k) {
    return new Vec2(
      this.x * k,
      this.y * k,
    );
  }

  interpolateTo(other, progress) {
    return this.scale(1 - progress).add(other.scale(progress));
  }
}

function smooth(x) {
  return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
}

async function main() {
  let debug = true;

  window.addEventListener('keydown', event => {
    if (event.key == 'd') {
      debug ^= true;
    }
  });
  window.addEventListener('click', event => {
    debug ^= true;
  });

  document.body.style = `
    padding: 0;
    margin: 0;
    overflow: hidden;
  `;
  const canvas = document.createElement('canvas');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  document.body.append(canvas);

  const context = canvas.getContext('2d');

  const prevFromPoint = new Vec2();
  const fromPoint = new Vec2();
  const toPoint = new Vec2();

  const travelSteps = 200;
  const pointSize = 20;
  context.lineWidth = 3;
  while (true) {
    prevFromPoint.copy(fromPoint);
    fromPoint.copy(toPoint);
    toPoint.set(
      (0.25 + 0.5 * Math.random()) * innerWidth,
      (0.25 + 0.5 * Math.random()) * innerHeight,
    );

    const prevSmoothPoint = new Vec2();
    prevSmoothPoint.copy(fromPoint);
    const prevPrevSmoothPoint = new Vec2();
    prevPrevSmoothPoint.copy(fromPoint);

    for (let i = 0; i < travelSteps; ++i) {
      const progress = i / travelSteps;

      const projectedPoint = fromPoint.interpolateTo(fromPoint.add(fromPoint.subtract(prevFromPoint)), progress);
      const trajectoryPoint = fromPoint.interpolateTo(toPoint, progress);
      const smoothPoint = projectedPoint.interpolateTo(trajectoryPoint, smooth(progress));

      context.clearRect(0, 0, innerWidth, innerHeight);
      if (debug) {
        context.strokeStyle = 'black';
        for (const point of [prevFromPoint, fromPoint, toPoint]) {
          context.strokeRect(point.x, point.y, pointSize, pointSize);
        }
        context.fillStyle = '#0002';
        for (const point of [projectedPoint, trajectoryPoint]) {
          context.fillRect(point.x, point.y, pointSize, pointSize);
        }

        const deltaScale = 20;
        const deltaDeltaScale = 1000;
        const smoothDelta = smoothPoint.subtract(prevSmoothPoint);
        const prevSmoothDelta = prevSmoothPoint.subtract(prevPrevSmoothPoint);
        const smoothDeltaDelta = smoothDelta.subtract(prevSmoothDelta);
        context.strokeStyle = 'green';
        context.beginPath();
        context.moveTo(innerWidth / 2, innerHeight / 2);
        context.lineTo(
          innerWidth / 2 + smoothDelta.x * deltaScale,
          innerHeight / 2 + smoothDelta.y * deltaScale,
        );
        context.stroke();
        context.strokeStyle = 'red';
        context.beginPath();
        context.moveTo(innerWidth / 2, innerHeight / 2);
        context.lineTo(
          innerWidth / 2 + smoothDeltaDelta.x * deltaDeltaScale,
          innerHeight / 2 + smoothDeltaDelta.y * deltaDeltaScale,
        );
        context.stroke();
      }
      context.fillStyle = 'blue';
      context.fillRect(smoothPoint.x, smoothPoint.y, pointSize, pointSize);

      prevPrevSmoothPoint.copy(prevSmoothPoint);
      prevSmoothPoint.copy(smoothPoint);

      await new Promise(requestAnimationFrame);
    }
  }
}

main();