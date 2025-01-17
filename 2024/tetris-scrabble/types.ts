export interface GameState {
  grid: Array<Array<Cell>>;
  piece: Piece,
  nextPiece: Piece,
  lastTime: number;
  stepDownTimer: Timer;
}

// string is a colour.
export type Cell = string | null;

export interface Piece {
  index: number,
  orientationIndex: number;
  position: {
    row: number;
    col: number;
  };
}

export interface Timer {
  duration: number;
  remaining: number;
}

export interface PieceShape {
  name: string;
  weight: number;
  colour: string;
  size: number;
  orientations: Array<Array<string>>;
}
