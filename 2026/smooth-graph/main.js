const TAU = Math.PI * 2;
const canvasSize = 1024;
let points = [];
let context = null;

function main() {
  document.body.append(
    button('Undo-ish', () => points.splice(-1, 1)),
    button('Clear', () => points = []),
    br(),
    canvas(),
  );
}

function button(text, callback) {
  const element = document.createElement('button');
  element.textContent = text;
  element.addEventListener('click', () => {
    callback();
    redraw();
  });
  return element;
}

function br() {
  return document.createElement('br');
}

function canvas() {
  const element = document.createElement('canvas');
  context = element.getContext('2d');
  element.width = canvasSize;
  element.height = canvasSize;
  element.addEventListener('pointerdown', event => {
    for (const point of points) {
      if (point.x === event.offsetX) {
        point.y = event.offsetY;
        redraw();
        return;
      }
    }
    points.push({x: event.offsetX, y: event.offsetY});
    redraw();
  });
  return element;
}

function redraw() {
  context.clearRect(0, 0, canvasSize, canvasSize);

  const sortedPoints = points.toSorted((a, b) => a.x - b.x);

  if (sortedPoints.length > 1) {
    sortedPoints[0].slope = slope(sortedPoints[0], sortedPoints[1]);
    for (let i = 1; i + 1 < sortedPoints.length; ++i) {
      sortedPoints[i].slope = (
        slope(sortedPoints[i - 1], sortedPoints[i]) +
        slope(sortedPoints[i], sortedPoints[i + 1])
      ) / 2;
    }
    sortedPoints[sortedPoints.length - 1].slope = slope(sortedPoints[sortedPoints.length - 2], sortedPoints[sortedPoints.length - 1]);

    // for (let pass = 0; pass < 3; ++pass) {
    //   let average = 0;
    //   let nextAverage = 0;
    //   for (let i = 1; i + 1 < sortedPoints.length; ++i) {
    //     nextAverage = (
    //       sortedPoints[i - 1].slope +
    //       sortedPoints[i - 0].slope +
    //       sortedPoints[i + 1].slope
    //     ) / 3;
    //     if (i > 1) {
    //       sortedPoints[i - 1].slope = average;
    //     }
    //     average = nextAverage;
    //   }
    //   sortedPoints[sortedPoints.length - 2].slope = average;
    // }

    context.beginPath();
    for (let i = 0; i < sortedPoints.length; ++i) {
      const point = sortedPoints[i];
      if (i > 0) {
        const previousPoint = sortedPoints[i - 1];
        context.moveTo(previousPoint.x, point.y - point.slope * xDelta(previousPoint, point));
        context.lineTo(point.x, point.y);
      }
      if (i + 1 < sortedPoints.length) {
        const nextPoint = sortedPoints[i + 1];
        context.moveTo(point.x, point.y);
        context.lineTo(nextPoint.x, point.y + point.slope * xDelta(point, nextPoint));
      }
    }
    context.strokeStyle = 'grey';
    context.stroke();

    context.beginPath();
    for (let i = 0; i + 1 < sortedPoints.length; ++i) {
      const point = sortedPoints[i];
      const nextPoint = sortedPoints[i + 1];
      const delta = xDelta(point, nextPoint);
      context.moveTo(point.x, point.y);
      for (let x = point.x; x <= nextPoint.x; ++x) {
        context.lineTo(
          x,
          lerp(
            point.y + (x - point.x) * point.slope,
            nextPoint.y + (x - nextPoint.x) * nextPoint.slope,
            smooth((x - point.x) / delta),
          ),
        );
      }
    }
    context.strokeStyle = 'black';
    context.stroke();
  }

  const dotSize = 4;
  context.beginPath();
  for (const {x, y} of sortedPoints) {
    context.moveTo(x, y);
    context.arc(x, y, dotSize, 0, TAU);
  }
  context.fill();
}

function slope(pointA, pointB) {
  return (pointB.y - pointA.y) / xDelta(pointA, pointB)
}

function xDelta(pointA, pointB) {
  return pointB.x - pointA.x;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smooth(x) {
  // return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  return x;
}

main();