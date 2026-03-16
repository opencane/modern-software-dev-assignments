import { Tile as TileType } from '../types';

interface TileProps {
  tile: TileType;
}

const getTileColor = (value: number): string => {
  const colors: { [key: number]: string } = {
    2: 'bg-amber-100 text-gray-800',
    4: 'bg-amber-200 text-gray-800',
    8: 'bg-orange-400 text-white',
    16: 'bg-orange-500 text-white',
    32: 'bg-orange-600 text-white',
    64: 'bg-red-500 text-white',
    128: 'bg-yellow-400 text-white',
    256: 'bg-yellow-500 text-white',
    512: 'bg-yellow-600 text-white',
    1024: 'bg-emerald-500 text-white',
    2048: 'bg-emerald-600 text-white',
  };
  return colors[value] || 'bg-gray-800 text-white';
};

export default function Tile({ tile }: TileProps) {
  const { value, position, isNew } = tile;
  const colorClass = getTileColor(value);
  const cellSize = 25;
  const gap = 2;
  const posX = position.col * (cellSize + gap);
  const posY = position.row * (cellSize + gap);

  const style = {
    width: `${cellSize}%`,
    height: `${cellSize}%`,
    left: `${posX}%`,
    top: `${posY}%`,
  };

  return (
    <div
      className={`absolute flex items-center justify-center rounded-lg font-bold text-3xl transition-all duration-150 ${colorClass} ${
        isNew ? 'animate-pop' : ''
      }`}
      style={style}
    >
      {value}
    </div>
  );
}
