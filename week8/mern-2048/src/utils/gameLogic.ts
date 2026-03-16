import { Tile, GameState, Direction } from '../types';

const GRID_SIZE = 4;
let tileIdCounter = 0;

export function createEmptyGrid(): (Tile | null)[][] {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));
}

export function initializeGame(): GameState {
  const grid = createEmptyGrid();
  addRandomTile(grid);
  addRandomTile(grid);

  return {
    grid,
    score: 0,
    isGameOver: false,
    isWon: false,
  };
}

export function addRandomTile(grid: (Tile | null)[][]): void {
  const emptyCells: { row: number; col: number }[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!grid[row][col]) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length > 0) {
    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    grid[row][col] = {
      id: tileIdCounter++,
      value,
      position: { row, col },
      isNew: true,
    };
  }
}

function copyGrid(grid: (Tile | null)[][]): (Tile | null)[][] {
  return grid.map(row => row.map(tile => tile ? { ...tile } : null));
}

function rotateCCW(grid: (Tile | null)[][]): (Tile | null)[][] {
  const newGrid = createEmptyGrid();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      newGrid[GRID_SIZE - 1 - col][row] = grid[row][col];
      if (newGrid[GRID_SIZE - 1 - col][row]) {
        newGrid[GRID_SIZE - 1 - col][row]!.position = { row: GRID_SIZE - 1 - col, col: row };
      }
    }
  }
  return newGrid;
}

function rotateCW(grid: (Tile | null)[][]): (Tile | null)[][] {
  const newGrid = createEmptyGrid();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      newGrid[col][GRID_SIZE - 1 - row] = grid[row][col];
      if (newGrid[col][GRID_SIZE - 1 - row]) {
        newGrid[col][GRID_SIZE - 1 - row]!.position = { row: col, col: GRID_SIZE - 1 - row };
      }
    }
  }
  return newGrid;
}

function moveLeft(grid: (Tile | null)[][]): { grid: (Tile | null)[][]; scoreGained: number; moved: boolean } {
  let scoreGained = 0;
  let moved = false;
  const newGrid = createEmptyGrid();

  for (let row = 0; row < GRID_SIZE; row++) {
    const tiles: Tile[] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col]) {
        tiles.push(grid[row][col]!);
      }
    }

    let targetCol = 0;
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];

      if (i < tiles.length - 1 && tiles[i].value === tiles[i + 1].value) {
        const mergedTile: Tile = {
          id: tileIdCounter++,
          value: tile.value * 2,
          position: { row, col: targetCol },
          mergedFrom: [tile, tiles[i + 1]],
        };
        newGrid[row][targetCol] = mergedTile;
        scoreGained += mergedTile.value;
        moved = true;
        targetCol++;
        i++;
      } else {
        const movedTile = { ...tile, position: { row, col: targetCol } };
        newGrid[row][targetCol] = movedTile;
        if (tile.position.col !== targetCol) {
          moved = true;
        }
        targetCol++;
      }
    }
  }

  return { grid: newGrid, scoreGained, moved };
}

export function move(state: GameState, direction: Direction): GameState {
  let grid = copyGrid(state.grid);
  let rotations = 0;

  switch (direction) {
    case 'up':
      grid = rotateCCW(grid);
      rotations = 1;
      break;
    case 'down':
      grid = rotateCW(grid);
      rotations = 3;
      break;
    case 'right':
      grid = rotateCW(rotateCW(grid));
      rotations = 2;
      break;
  }

  const { grid: movedGrid, scoreGained, moved } = moveLeft(grid);
  let finalGrid = movedGrid;

  for (let i = 0; i < rotations; i++) {
    finalGrid = rotateCW(finalGrid);
  }

  if (!moved) {
    return state;
  }

  addRandomTile(finalGrid);

  const isGameOver = checkGameOver(finalGrid);
  const isWon = checkWin(finalGrid) || state.isWon;

  return {
    grid: finalGrid,
    score: state.score + scoreGained,
    isGameOver,
    isWon,
  };
}

export function checkGameOver(grid: (Tile | null)[][]): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!grid[row][col]) return false;

      if (col < GRID_SIZE - 1 && grid[row][col]?.value === grid[row][col + 1]?.value) {
        return false;
      }
      if (row < GRID_SIZE - 1 && grid[row][col]?.value === grid[row + 1][col]?.value) {
        return false;
      }
    }
  }
  return true;
}

export function checkWin(grid: (Tile | null)[][]): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col]?.value === 2048) {
        return true;
      }
    }
  }
  return false;
}

export function saveGameState(state: GameState, time: number): void {
  localStorage.setItem('game2048State', JSON.stringify({ ...state, time }));
}

export function loadGameState(): { state: GameState; time: number } | null {
  const saved = localStorage.getItem('game2048State');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { state: parsed, time: parsed.time || 0 };
    } catch {
      return null;
    }
  }
  return null;
}

export function clearGameState(): void {
  localStorage.removeItem('game2048State');
}

export function getBestScore(): number {
  const saved = localStorage.getItem('bestScore2048');
  return saved ? parseInt(saved, 10) : 0;
}

export function saveBestScore(score: number): void {
  const best = getBestScore();
  if (score > best) {
    localStorage.setItem('bestScore2048', score.toString());
  }
}
