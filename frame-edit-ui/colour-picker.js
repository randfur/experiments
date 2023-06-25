import {createObservableJsonProxy, write} from './third-party/rojs/src/observable-json.js';
import {DrawingTool} from './drawing-tool.js';

export class ColourPicker {
  static kColours = [
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

  static model = createObservableJsonProxy({
    colour: this.kColours[0],
  });

  static uiTemplate = this.kColours.map(colour => ({
    tag: 'button',
    events: {
      click: () => write(DrawingTool.model.colour, colour),
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