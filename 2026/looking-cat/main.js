async function main() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  document.body.append(canvas);
  document.body.style.overflow = 'hidden';
  document.body.style.background = '#55aa22';

  const catImage = {
    left: await loadImage('cat-left.png'),
    down: await loadImage('cat-down.png'),
    right: await loadImage('cat-right.png'),
  };
  const playerImage = {
    up: [await loadImage('player-up-0.png'), await loadImage('player-up-1.png')],
    down: [await loadImage('player-down-0.png'), await loadImage('player-down-1.png')],
    left: [await loadImage('player-left-0.png'), await loadImage('player-left-1.png')],
    right: [await loadImage('player-right-0.png'), await loadImage('player-right-1.png')],
  };

  const catWidth = 1100;
  const catLookThreshold = 300;
  const playerWidth = 100;
  const playerHeight = 200;
  let playerMotionStepCount = 30;
  let playerX = width / 2;
  let playerY = height;
  let playerMotion = 0;
  let playerDirection = 'up';
  let playerMoving = false;
  const speed = 10;

  function drawPlayer() {
    context.drawImage(playerImage[playerDirection][Math.floor(playerMotion / playerMotionStepCount) % 2], playerX - (playerWidth / 2), playerY - playerHeight);
  }

  function drawCat() {
    const playerOffset = playerX - (width / 2);
    context.drawImage(
      playerOffset < -catLookThreshold
      ? catImage.left
      : (
        playerOffset > catLookThreshold
        ? catImage.right
        : catImage.down
      ),
      width / 2 - catWidth / 2,
      0,
    );
  }

  let keyState = {};
  window.addEventListener('keydown', event => {
    keyState[event.key] = true;
  });
  window.addEventListener('keyup', event => {
    keyState[event.key] = false;
  });

  while (true) {
    await new Promise(requestAnimationFrame);
    context.clearRect(0, 0, width, height);

    if (!playerMoving) {
      if (keyState['ArrowUp']) {
        playerMoving = true;
        playerDirection = 'up';
      } else if (keyState['ArrowDown']) {
        playerMoving = true;
        playerDirection = 'down';
      } else if (keyState['ArrowLeft']) {
        playerMoving = true;
        playerDirection = 'left';
      } else if (keyState['ArrowRight']) {
        playerMoving = true;
        playerDirection = 'right';
      }
    } else {
      if (playerDirection === 'up' && !keyState['ArrowUp']) {
        playerMoving = false;
      }
      if (playerDirection === 'down' && !keyState['ArrowDown']) {
        playerMoving = false;
      }
      if (playerDirection === 'left' && !keyState['ArrowLeft']) {
        playerMoving = false;
      }
      if (playerDirection === 'right' && !keyState['ArrowRight']) {
        playerMoving = false;
      }
    }

    if (playerMoving) {
      playerMotion += 1;
      if (playerDirection === 'up') {playerY -= speed;}
      if (playerDirection === 'down') {playerY += speed;}
      if (playerDirection === 'left') {playerX -= speed;}
      if (playerDirection === 'right') {playerX += speed;}
    }

    if (playerY > 760) {
      drawCat();
      drawPlayer();
    } else {
      drawPlayer();
      drawCat();
    }
  }
}

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function loadImage(src) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = src;
  });
}

main();