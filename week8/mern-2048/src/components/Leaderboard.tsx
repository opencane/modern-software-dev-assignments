import { Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../lib/supabase';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Top Scores</h2>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No scores yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                index === 0
                  ? 'bg-yellow-50 border-2 border-yellow-400'
                  : index === 1
                  ? 'bg-gray-50 border-2 border-gray-300'
                  : index === 2
                  ? 'bg-orange-50 border-2 border-orange-300'
                  : 'bg-gray-50'
              }`}
            >
              <div className="text-xl font-bold text-gray-600 w-8 text-center">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{entry.name}</div>
                <div className="text-sm text-gray-600">{formatTime(entry.time)}</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">{entry.score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
