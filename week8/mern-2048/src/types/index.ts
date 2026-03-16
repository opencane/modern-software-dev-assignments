export interface Tile {
  id: number;
  value: number;
  position: { row: number; col: number };
  mergedFrom?: Tile[];
  isNew?: boolean;
}

export interface GameState {
  grid: (Tile | null)[][];
  score: number;
  isGameOver: boolean;
  isWon: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
