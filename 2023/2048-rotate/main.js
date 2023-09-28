const pieceSize = 200;

async function main() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  document.body.append(canvas);

  const gravitySensor = new GravitySensor({ frequency: 60 });
  gravitySensor.start();

  const pieces = range(20).map(i => ({
    x: random(width - pieceSize),
    y: random(height - pieceSize),
  }));

  const corners = [
    {x: 0, y: 0},
    {x: 0, y: 1},
    {x: 1, y: 0},
    {x: 1, y: 1},
  ];

  while (true) {
    await new Promise(requestAnimationFrame);
    context.clearRect(0, 0, width, height);

    const gravity = {
      x: -gravitySensor.x,
      y: gravitySensor.y,
    };

    pieces.sort((a, b) => dot(b, gravity) - dot(a, gravity));

    for (const [piece, i] of enumerate(pieces)) {
      let colliding = false;
      for (const corner of corners) {
        let x = piece.x + corner.x * pieceSize;
        let y = piece.y + corner.y * pieceSize;
        if (x < 0 || x > width || y < 0 || y > height) {
          colliding = true;
        }
        for (let j = 0; !colliding && j < i; ++j) {
          const otherPiece = pieces[j];
          if (
              (x < otherPiece.x + pieceSize) &&
              (y < otherPiece.y + pieceSize) &&
              (x > otherPiece.x) &&
              (y > otherPiece.y)
            ) {
            colliding = true;
            break;
          }
        }
      }

      if (!colliding) {
        piece.x += gravity.x;
        piece.y += gravity.y;
      }

      context.fillStyle = `rgb(${i * 2}, 255, 0)`;
      context.fillRect(piece.x, piece.y, pieceSize, pieceSize);
    }
  }
}

function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function* enumerate(list) {
  for (let i = 0; i < list.length; ++i) {
    yield [list[i], i];
  }
}

function random(x) {
  return Math.random() * x;
}

main();