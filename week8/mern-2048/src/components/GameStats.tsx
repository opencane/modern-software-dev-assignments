interface GameStatsProps {
  score: number;
  bestScore: number;
  time: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function GameStats({ score, bestScore, time }: GameStatsProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="bg-orange-500 text-white rounded-lg px-6 py-3 shadow-md">
        <div className="text-sm font-semibold uppercase opacity-90">Score</div>
        <div className="text-2xl font-bold">{score}</div>
      </div>
      <div className="bg-orange-600 text-white rounded-lg px-6 py-3 shadow-md">
        <div className="text-sm font-semibold uppercase opacity-90">Best</div>
        <div className="text-2xl font-bold">{bestScore}</div>
      </div>
      <div className="bg-blue-500 text-white rounded-lg px-6 py-3 shadow-md">
        <div className="text-sm font-semibold uppercase opacity-90">Time</div>
        <div className="text-2xl font-bold">{formatTime(time)}</div>
      </div>
    </div>
  );
}
