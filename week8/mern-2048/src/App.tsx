import { useEffect, useState, useCallback } from 'react';
import Grid from './components/Grid';
import GameStats from './components/GameStats';
import Leaderboard from './components/Leaderboard';
import {
  initializeGame,
  move,
  saveGameState,
  loadGameState,
  clearGameState,
  getBestScore,
  saveBestScore,
} from './utils/gameLogic';
import { getTopScores, submitScore, LeaderboardEntry } from './lib/supabase';
import { GameState, Direction } from './types';
import { RotateCcw } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGameState();
    return saved ? saved.state : initializeGame();
  });
  const [time, setTime] = useState(() => {
    const saved = loadGameState();
    return saved ? saved.time : 0;
  });
  const [bestScore, setBestScore] = useState(getBestScore());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (gameState.isGameOver && !showGameOverModal) {
      saveBestScore(gameState.score);
      setBestScore(getBestScore());
      setShowGameOverModal(true);
    }
  }, [gameState.isGameOver, showGameOverModal]);

  useEffect(() => {
    if (!gameState.isGameOver) {
      const interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.isGameOver]);

  useEffect(() => {
    if (!gameState.isGameOver) {
      saveGameState(gameState, time);
    }
  }, [gameState, time]);

  const loadLeaderboard = async () => {
    const scores = await getTopScores(10);
    setLeaderboard(scores);
  };

  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameState.isGameOver) return;
      const newState = move(gameState, direction);
      setGameState(newState);
    },
    [gameState]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;

      const keyMap: { [key: string]: Direction } = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isGameOver, handleMove]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        handleMove(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        handleMove(deltaY > 0 ? 'down' : 'up');
      }
    }

    setTouchStart(null);
  };

  const handleNewGame = () => {
    clearGameState();
    setGameState(initializeGame());
    setTime(0);
    setShowGameOverModal(false);
    setPlayerName('');
  };

  const handleSubmitScore = async () => {
    if (!playerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await submitScore(playerName.trim(), gameState.score, time);

    if (success) {
      await loadLeaderboard();
      setShowGameOverModal(false);
      setPlayerName('');
    }
    setIsSubmitting(false);
  };

  const isTopScore = () => {
    if (leaderboard.length < 10) return true;
    return gameState.score > leaderboard[leaderboard.length - 1].score;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-2">2048</h1>
          <p className="text-gray-600">Join tiles to reach 2048!</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-4">
              <GameStats score={gameState.score} bestScore={bestScore} time={time} />
              <button
                onClick={handleNewGame}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-md"
              >
                <RotateCcw size={20} />
                New Game
              </button>
            </div>

            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="touch-none"
            >
              <Grid grid={gameState.grid} />
            </div>

            <div className="mt-6 text-center text-gray-600 max-w-md">
              <p className="font-semibold mb-2">How to play:</p>
              <p className="text-sm">
                Use arrow keys (or WASD) on desktop, or swipe on mobile to move tiles.
                When two tiles with the same number touch, they merge into one!
              </p>
            </div>
          </div>

          <Leaderboard entries={leaderboard} />
        </div>
      </div>

      {showGameOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Over!</h2>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Final Score:</span>
                <span className="text-3xl font-bold text-orange-600">{gameState.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time:</span>
                <span className="text-xl font-semibold text-blue-600">
                  {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {isTopScore() && (
              <div className="mb-6">
                <p className="text-green-600 font-semibold mb-3">
                  You made it to the top 10! Enter your name:
                </p>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitScore()}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none mb-3"
                  maxLength={20}
                />
                <button
                  onClick={handleSubmitScore}
                  disabled={!playerName.trim() || isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Score'}
                </button>
              </div>
            )}

            <button
              onClick={handleNewGame}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
