function print(text) {
  output.textContent += 'TODO: ' + text + '\n';
}

function createToolOptions() {
  return [{
    name: 'Brush',
    action() { print('select brush'); },
    options: [{
      name: 'Small',
      action() { print('select small brush'); },
    }, {
      name: 'Medium',
      action() { print('select medium brush'); },
    }, {
      name: 'Large',
      action() { print('select large brush'); },
    }],
  }, {
    name: 'Fill',
    action() { print('select fill'); },
  }, {
    name: 'Eraser',
    action() { print('select eraser'); },
  }, {
    name: 'Shape',
    action() { print('select shape'); },
  }];
}

function createColourOptions() {
  return [{
    name: 'Colour picker',
    action() { print('select colour picker'); },
  }, {
    name: 'Palette',
    action() { print('open palette picker'); },
    options: [{
      name: 'Red',
      action() { print('set colour to red'); },
    }, {
      name: 'Orange',
      action() { print('set colour to orange'); },
    }, {
      name: 'Yellow',
      action() { print('set colour to yellow'); },
    }, {
      name: 'Green',
      action() { print('set colour to green'); },
    }, {
      name: 'Cyan',
      action() { print('set colour to cyan'); },
    }, {
      name: 'Blue',
      action() { print('set colour to blue'); },
    }, {
      name: 'Purple',
      action() { print('set colour to purple'); },
    }],
  }];
}

export function createCommandSet(drawingBoard) {
  return [{
    name: 'Primary tool',
    action() { print('select primary tool'); },
    options: createToolOptions().reverse(),
  }, {
    name: 'Edit',
    action() {},
    options: [{
      name: 'Duplicate',
      action() { print('duplicate selection'); },
    }, {
      name: 'Delete',
      action() { print('delete selection'); },
    }, {
      name: 'Paste',
      action() { print('paste clipboard into selection'); },
    }, {
      name: 'Copy',
      action() { print('copy selection into clipboard'); },
    }, {
      name: 'Cut',
      action() { print('cut selection into clipboard'); },
    }],
  }, {
    name: 'Primary colour',
    action() { print('select primary colour'); },
    options: createColourOptions(),
  }, {
    name: 'Menu',
    action() {},
    options: [{
      name: 'Save',
      action() { print('save'); },
    }, {
      name: 'Clear',
      action() {
        drawingBoard.clear();
      },
    }],
  }, {
    name: 'Secondary tool',
    action() { print('select secondary tool'); },
    options: createToolOptions(),
  }, {
    name: 'Undo',
    action() { print('undo'); },
    options: [{
      name: 'Undo',
      action() { print('undo'); },
    }, {
      name: 'Redo',
      action() { print('redo'); },
    }],
  }, {
    name: 'Secondary colour',
    action() { print('select secondary colour'); },
    options: createColourOptions().reverse(),
  }, {
    name: 'Select',
    action() { print('select lasso selection'); },
    options: [{
      name: 'Polygon',
      action() { print('select polygon selection'); },
    }, {
      name: 'Rectangle',
      action() { print('select rectangle selection'); },
    }, {
      name: 'Lasso',
      action() { print('select lasso selection'); },
    }],
  }];
}