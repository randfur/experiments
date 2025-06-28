const width = innerWidth;
const height = innerHeight;

canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');

const radius = 100;
const midX = width / 2;
const midY = height / 2;

context.strokeStyle = 'black';
context.lineWidth = 4;
context.beginPath();
context.moveTo(midX + radius, midY + radius / Math.sqrt(3));
context.lineTo(midX, midY + radius * 2 / Math.sqrt(3));
context.lineTo(midX - radius, midY + radius / Math.sqrt(3));
context.lineTo(midX - radius, midY - radius / Math.sqrt(3));
context.lineTo(midX, midY - radius * 2 / Math.sqrt(3));
context.lineTo(midX + radius, midY - radius / Math.sqrt(3));
context.closePath();
context.stroke();