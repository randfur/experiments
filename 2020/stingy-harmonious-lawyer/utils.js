export function log(text) {
  output.textContent += text + '\n';
}

export function random(x) {
  return Math.random() * x;
}

export function normaliseChannel(value) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

export function createColour(red, green, blue) {
  return normaliseChannel(red) << 16 | normaliseChannel(green) << 8 | normaliseChannel(blue);
}

export function getRed(colour) {
  return colour >> 16;
}

export function getGreen(colour) {
  return (colour >> 8) & 0xFF;
}

export function getBlue(colour) {
  return colour & 0xFF;
}