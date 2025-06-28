import { TAU, kLeftButton, kRightButton, withinAngles } from './utils.js';
import { createCommandSet } from './commands.js';

const emptyRadius = 30;
const commandRadius = 100;
const optionRadius = 140;
const optionArc = TAU * 0.08;
const lineColour = 'black';
const lineWidth = 3;
const backingColour = '#eeee';
const highlightedColour = '#fc0d';
const minDragRadius = 3;

export class CommandWheel {
  constructor(event, remove, drawingBoard) {
    this.x = event.offsetX;
    this.y = event.offsetY;
    this.remove = remove;
    this.drawingBoard = drawingBoard;
    
    const commandSet = createCommandSet(drawingBoard);
    const commandArc = TAU / commandSet.length;
    this.commands = commandSet.map((command, index) => {
      const angleMid = -TAU / 2 + index * commandArc;
      return {
        ...command,
        angleStart: angleMid - commandArc / 2,
        angleMid,
        angleEnd: angleMid + commandArc / 2,
        options: command.options?.map((option, index) => {
          const angleStart = angleMid - command.options.length * optionArc / 2 + index * optionArc;
          return {
            ...option,
            angleStart,
            angleMid: angleStart + optionArc / 2,
            angleEnd: angleStart + optionArc,
          };
        }),
      };
    });
    
    this.lastMouseX = this.x;
    this.lastMouseY = this.y;
    this.leftDown = false;
    this.dragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragDeltaX = 0;
    this.dragDeltaY = 0;

    this.selectedCommand = null;
  }
  
  handleMouseDown(event) {
    if (event.button == kLeftButton) {
      this.leftDown = true;
      this.dragging = false;
      this.dragStartX = this.lastMouseX;
      this.dragStartY = this.lastMouseY;
      this.dragDeltaX = this.x - this.dragStartX;
      this.dragDeltaY = this.y - this.dragStartY;
    }
    return null;
  }
  
  handleMouseMove(event) {
    this.lastMouseX = event.offsetX;
    this.lastMouseY = event.offsetY;
    if (this.leftDown) {
      const dx = this.lastMouseX - this.dragStartX;
      const dy = this.lastMouseY - this.dragStartY;
      this.dragging |= dx ** 2 + dy ** 2 >= minDragRadius ** 2;
      if (this.dragging) {
        this.x = this.lastMouseX + this.dragDeltaX;
        this.y = this.lastMouseY + this.dragDeltaY;
      }
    }
    return null;
  }
  
  handleMouseUp(event) {
    if (event.button == kLeftButton) {
      this.leftDown = false;
      if (!this.dragging) {
        if (this.isMouseInEmpty()) {
          this.remove();
        } else if (this.selectedCommand) {
          const mouseOption = this.getMouseOption();
          if (!mouseOption) {
            this.selectedCommand = null;
          } else {
            this.remove();
            mouseOption.action();
          }
        } else {
          const mouseCommand = this.getMouseCommand();
          if (mouseCommand?.options) {
            this.selectedCommand = mouseCommand;
          }
        }
      }
    }
    if (event.button == kRightButton) {
      this.remove();
      if (this.selectedCommand) {
        this.getMouseOption()?.action();
      } else {
        this.getMouseCommand()?.action();
      }
    }
    return null;
  }

  isMouseInEmpty() {
    const dx = this.lastMouseX - this.x;
    const dy = this.lastMouseY - this.y;
    return dx ** 2 + dy ** 2 <= emptyRadius ** 2;
  }
  
  getMouseCommand() {
    if (this.isMouseInEmpty()) {
      return null;
    }
    const dx = this.lastMouseX - this.x;
    const dy = this.lastMouseY - this.y;
    let bestDot = -Infinity;
    let bestCommand = null;
    for (let i = 0; i < this.commands.length; ++i) {
      const command = this.commands[i];
      const dot = dx * Math.cos(command.angleMid) + dy * Math.sin(command.angleMid);
      if (dot > bestDot) {
        bestCommand = command;
        bestDot = dot;
      }
    }
    return bestCommand;
  }
  
  getMouseOption() {
    if (!this.selectedCommand?.options) {
      return null;
    }
    const dx = this.lastMouseX - this.x;
    const dy = this.lastMouseY - this.y;
    if (dx ** 2 + dy ** 2 <= commandRadius ** 2) {
      return null;
    }
    for (const option of this.selectedCommand.options) {
      if (withinAngles(dx, dy, option.angleStart, option.angleEnd)) {
        return option;
      }
    }
    return null;
  }
  
  draw(context) {
    context.strokeStyle = lineColour;
    context.lineWidth = lineWidth;
    
    const mouseCommand = this.getMouseCommand();
    const mouseOption = this.getMouseOption();
    
    // Command wedge fills.
    for (let i = 0; i < this.commands.length; ++i) {
      const command = this.commands[i];
      let fillColour = backingColour;
      if ((mouseOption && this.selectedCommand == command) || (!this.selectedCommand && mouseCommand == command)) {
        fillColour = highlightedColour;
      }
      context.fillStyle = fillColour;
      context.beginPath();
      context.arc(this.x, this.y, emptyRadius, command.angleStart, command.angleEnd, false);
      context.arc(this.x, this.y, commandRadius, command.angleEnd, command.angleStart, true);
      context.fill();
    }
    
    // Option wedge fills.
    if (this.selectedCommand?.options) {
      const options = this.selectedCommand.options;
      for (let i = 0; i < options.length; ++i) {
        const option = options[i];
        context.fillStyle = mouseOption == option ? highlightedColour : backingColour;
        context.beginPath();
        context.arc(this.x, this.y, commandRadius, option.angleStart, option.angleEnd, false);
        context.arc(this.x, this.y, optionRadius, option.angleEnd, option.angleStart, true);
        context.fill();
      }
    }

    // Circle edge.
    context.beginPath();
    context.arc(this.x, this.y, emptyRadius, 0, TAU);
    context.moveTo(this.x + commandRadius, this.y);
    context.arc(this.x, this.y, commandRadius, 0, TAU);
    context.stroke();

    // Command wedge edges and text.
    for (let i = 0; i < this.commands.length; ++i) {
      const command = this.commands[i];

      context.beginPath();
      context.moveTo(
        this.x + Math.cos(command.angleStart) * emptyRadius,
        this.y + Math.sin(command.angleStart) * emptyRadius,
      );
      context.lineTo(
        this.x + Math.cos(command.angleStart) * commandRadius,
        this.y + Math.sin(command.angleStart) * commandRadius,
      );
      context.stroke();
      
      context.fillStyle = lineColour;
      const textRadius = commandRadius * 0.8;
      context.fillText(
        command.name,
        this.x + Math.cos(command.angleMid) * textRadius - command.name.length * 2.4,
        this.y + Math.sin(command.angleMid) * textRadius,
      );
    }

    // Option wedge edges and text.
    if (this.selectedCommand?.options) {
      const options = this.selectedCommand.options;

      context.beginPath();
      context.moveTo(
        this.x + Math.cos(options[0].angleStart) * commandRadius,
        this.y + Math.sin(options[0].angleStart) * commandRadius,
      );
      context.lineTo(
        this.x + Math.cos(options[0].angleStart) * optionRadius,
        this.y + Math.sin(options[0].angleStart) * optionRadius,
      );
      context.arc(
        this.x,
        this.y,
        optionRadius,
        options[0].angleStart,
        options[options.length - 1].angleEnd,
      );
      context.stroke();

      for (let i = 0; i < options.length; ++i) {
        const option = options[i];
        context.beginPath();
        context.moveTo(
          this.x + Math.cos(option.angleEnd) * commandRadius,
          this.y + Math.sin(option.angleEnd) * commandRadius,
        );
        context.lineTo(
          this.x + Math.cos(option.angleEnd) * optionRadius,
          this.y + Math.sin(option.angleEnd) * optionRadius,
        );
        context.stroke();

        context.fillStyle = lineColour;
        const textRadius = (commandRadius + optionRadius) / 2;
        context.fillText(
          option.name,
          this.x + Math.cos(option.angleMid) * textRadius - option.name.length * 2.4,
          this.y + Math.sin(option.angleMid) * textRadius,
        );
      }
    }
  }
}