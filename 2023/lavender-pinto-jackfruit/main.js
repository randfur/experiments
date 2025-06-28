const TAU = Math.PI * 2;
const places = [1, 2, 3, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 3, 3, 2, 1, 1, 2, 1, 1, 2, 3, 3, 2, 1, 2, 3, 3, 2, 1, 2, 3, 3, 2, 1, 1, 2, 1, 1, 2, 3, 3, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 3, 2, 1];

function* enumerate(list) {
  for (let i = 0; i < list.length; ++i) {
    yield [i, list[i]];
  }
}

function main() {
  canvas.width = 1000;
  canvas.height = 1000;
  const context = canvas.getContext('2d');
  
  const centreX = canvas.width / 2;
  const centreY = canvas.height / 2;
  
  context.lineWidth = 5;
  
  context.beginPath();
  for (const [i, place] of enumerate(places)) {
    const angle = TAU * (i + 0.5) / places.length;
    const radius = place * 100;
    context[i === 0 ? 'moveTo' : 'lineTo'](centreX + Math.sin(angle) * radius, centreY - Math.cos(angle) * radius);
  }
  context.closePath();
  context.stroke();
}

main();