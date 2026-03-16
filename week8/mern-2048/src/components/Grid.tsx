import { Tile as TileType } from '../types';
import Tile from './Tile';

interface GridProps {
  grid: (TileType | null)[][];
}

export default function Grid({ grid }: GridProps) {
  const tiles: TileType[] = [];

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col]) {
        tiles.push(grid[row][col]!);
      }
    }
  }

  return (
    <div className="relative bg-gray-400 rounded-xl p-3 shadow-lg overflow-hidden" style={{ width: '320px', height: '320px' }}>
      <div className="absolute inset-3 grid grid-cols-4 gap-2 pointer-events-none">
        {Array(16)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-gray-300 rounded-lg"></div>
          ))}
      </div>

      <div className="absolute inset-3">
        <div className="relative w-full h-full">
          {tiles.map(tile => (
            <Tile key={tile.id} tile={tile} />
          ))}
        </div>
      </div>
    </div>
  );
}
