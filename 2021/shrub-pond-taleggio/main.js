const width = innerWidth;
const height = innerHeight;
const canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');


const point1 = {
  x: width / 2,
  y: height / 2 + 200,
  width: 40,
};

const point2 = {
  x: width / 2,
  y: height / 2,
  width: 40,
};

const point3 = {
  x: width / 2 - 100,
  y: height / 2 - 200,
  width: 40,
};


function getDiff(a, b) {
  return {
    x: b.x - a.x,
    y: b.y - a.y,
  };
}

function getLength({x, y}) {
  return (x ** 2 + y ** 2) ** 0.5;
}

(async () => {
  addEventListener('touchmove', event => event.preventDefault(), { passive: false });
  addEventListener('pointermove', event => {
    point3.x = event.clientX;
    point3.y = event.clientY;
  });

  while (true) {
    await new Promise(requestAnimationFrame);

    const diff1 = getDiff(point1, point2);
    const diff1Length = getLength(diff1);

    const diff1SideDir = {
      x: -diff1.y / diff1Length,
      y: diff1.x / diff1Length,
    };

    const diff2 = getDiff(point2, point3);
    const diff2Length = getLength(diff2);

    const diff2SideDir = {
      x: -diff2.y / diff2Length,
      y: diff2.x / diff2Length,
    };

    const diff1BackDiff2Length = {
      x: -diff1.x / diff1Length * diff2Length,
      y: -diff1.y / diff1Length * diff2Length,
    };

    const midDiff = {
      x: (diff2.x + diff1BackDiff2Length.x) / 2,
      y: (diff2.y + diff1BackDiff2Length.y) / 2,
    };
    const midDiffLength = getLength(midDiff);
    const midSideDir = {
      x: midDiff.x / midDiffLength,
      y: midDiff.y / midDiffLength,
    };
    if (midSideDir.x * diff1SideDir.x + midSideDir.y * diff1SideDir.y < 0) {
      midSideDir.x *= -1;
      midSideDir.y *= -1;
    }

    context.clearRect(0, 0, width, height);

    // context.lineWidth = 3;
    // context.beginPath();
    // context.moveTo(point1.x, point1.y);
    // context.lineTo(point2.x, point2.y);
    // context.lineTo(point3.x, point3.y);
    // context.stroke();

    context.beginPath();
    context.moveTo(point1.x + diff1SideDir.x * point1.width, point1.y + diff1SideDir.y * point1.width);
    context.lineTo(point2.x + midSideDir.x * point2.width, point2.y + midSideDir.y * point2.width);
    context.lineTo(point3.x + diff2SideDir.x * point3.width, point3.y + diff2SideDir.y * point3.width);
    context.lineTo(point3.x - diff2SideDir.x * point3.width, point3.y - diff2SideDir.y * point3.width);
    context.lineTo(point2.x - midSideDir.x * point2.width, point2.y - midSideDir.y * point2.width);
    context.lineTo(point1.x - diff1SideDir.x * point1.width, point1.y - diff1SideDir.y * point1.width);
    context.fill();
  }
})();