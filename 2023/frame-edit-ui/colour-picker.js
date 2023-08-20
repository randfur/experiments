import {write, Component} from './third-party/rojs/src/rojs.js';

const kColours = [
  'white',
  'grey',
  'black',
  'red',
  'brown',
  'orange',
  'yellow',
  'lime',
  'green',
  'blue',
  'cyan',
  'pink',
  'purple',
];

export class ColourPicker extends Component {
  constructor() {
    super({
      model: {
        colour: kColours[0],
      },
    });
  }

  bundleInit() {
    this.view = kColours.map(colour => ({
      tag: 'button',
      events: {
        click: () => write(this.bundle.drawingTool.model.colour, colour),
      },
      children: [{
        style: {
          width: '16px',
          height: '16px',
          backgroundColor: colour,
        },
      }],
    }));
  }
}