const TAU = Math.PI * 2;
const maskSrc = 'https://static.wikia.nocookie.net/maditsmadfunny/images/4/4e/Twilight_Sparkle.png';
const twiSrc = 'https://pbs.twimg.com/media/FB7lCGKXsAMcB0r?format=jpg';

function range(n) {
  let result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function loadImage(src) {
  const image = new Image();
  return new Promise(resolve => {
    image.onload = () => resolve(image);
    image.src = src;
  });
}

function makeCanvas(width, height) {
  if (window.OffscreenCanvas) {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function main() {
  const width = innerWidth;
  const height = innerHeight;

  const canvas = document.getElementById('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  
  const [maskImage, twiImage] = await Promise.all([loadImage(maskSrc), loadImage(twiSrc)]);

  function generateAngle() {
    return (Math.random() * 2 - 1) * 0.01;
  }
  
  const twis = range(width * height / 5000).map(() => {
    const canvas = makeCanvas(maskImage.width, maskImage.height);
    const context = canvas.getContext('2d');
    context.drawImage(twiImage, -(twiImage.width - maskImage.width) * Math.random(), -(twiImage.height - maskImage.height) * Math.random());
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(maskImage, 0, 0);
    return {
      canvas,
      x: Math.random() * width,
      y: Math.random() * height,
      a: Math.random() * TAU,
      s: Math.random() * 0.5 + 0.75,
      dx: Math.random() * 2 - 1,
      dy: Math.random() * 2 - 1,
      da: generateAngle(),
    };
  });

  while (true) {
    await new Promise(requestAnimationFrame);
    context.drawImage(twiImage, 0, 0, width, height);
    for (const twi of twis) {
      twi.x += twi.dx;
      twi.y += twi.dy;
      twi.a += twi.da;
      if (twi.x < 0 || twi.x > width) {
        twi.dx *= -1;
        twi.da = generateAngle();
      }
      if (twi.y < 0 || twi.y > height) {
        twi.dy *= -1;
        twi.da = generateAngle();
      }
      context.save();
      context.translate(twi.x, twi.y);
      context.rotate(twi.a);
      context.scale(twi.s, twi.s);
      context.drawImage(twi.canvas, -twi.canvas.width / 2, -twi.canvas.height / 2);
      context.restore();
    }
  }
}
main();