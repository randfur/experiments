import './vec3.js';
import './engine.js';

const axes = [
  {axis: 'x', colour: 'red'},
  {axis: 'y', colour: 'lime'},
  {axis: 'z', colour: 'blue'},
];
const axesInterval = 100;
const axesIntervals = 5;
const axesDotSize = 4;

function drawAxesDot(colour) {
  context.fillStyle = colour;
  context.beginPath();
  context.arc(0, 0, axesDotSize, 0, TAU);
  context.fill();
}

for (let {axis, colour} of axes) {
  for (let distance = -axesIntervals; distance <= axesIntervals; ++distance) {
    if (distance == 0) {
      continue;
    }
    const pos = new Vec3();
    pos[axis] = distance * axesInterval;
    objects.push({
      pos,
      render() { drawAxesDot(colour); },
    });
  }
}

objects.push({
  pos: new Vec3(),
  render() { drawAxesDot('white'); },
});
