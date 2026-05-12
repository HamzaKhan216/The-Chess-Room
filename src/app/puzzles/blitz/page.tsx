'use client';

import React, { useEffect, useState, useRef } from 'react';
import Board, { drag } from '@/components/game/board';
import { BoardContainer } from '@/components/game/BoardContainer';
import { PuzzleData, fromUCI, isCorrectMove } from '@/utils/puzzle-logic';
import { Chess } from 'chess.js';
import { formatSquare, square } from '@/engine/stockfish';
import { PieceSymbol } from 'chess.js';
import Link from 'next/link';

type Difficulty = 'beginner' | 'intermediate' | 'expert';

const DIFFICULTY_MAP: Record<Difficulty, { min: number, max: number, label: string }> = {
  beginner: { min: 600, max: 1000, label: 'Beginner' },
  intermediate: { min: 1000, max: 1400, label: 'Intermediate' },
  expert: { min: 1400, max: 2000, label: 'Expert' },
};

export default function BlitzPuzzlesPage() {
  const [gamePhase, setGamePhase] = useState<'pre' | 'playing' | 'post'>('pre');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [puzzleQueue, setPuzzleQueue] = useState<PuzzleData[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleData | null>(null);
  const [chess, setChess] = useState(new Chess());
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);
  const [move, setMove] = useState<square[]>([]);
  const [forward, setForward] = useState(true);
  const [animation, setAnimation] = useState(true);
  const [drag, setDrag] = useState<drag>({ is: false, id: '' });
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef(false);

  // Load high score on mount and when difficulty changes
  useEffect(() => {
    const saved = localStorage.getItem(`blitz_highscore_${difficulty}`);
    setHighScore(saved ? parseInt(saved) : 0);
  }, [difficulty]);

  // Timer logic
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gamePhase]);

  // Pre-fetching logic
  useEffect(() => {
    if (gamePhase === 'playing' && puzzleQueue.length < 2 && !fetchingRef.current) {
      fetchPuzzles();
    }
  }, [gamePhase, puzzleQueue.length]);

  const fetchPuzzles = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { min, max } = DIFFICULTY_MAP[difficulty];
      const rating = (min + max) / 2;
      const res = await fetch(`/api/puzzle/blitz?rating=${rating}`);
      const data = await res.json();
      if (data.puzzles) {
        setPuzzleQueue((prev) => [...prev, ...data.puzzles]);
      }
    } catch (err) {
      console.error('Failed to fetch puzzles:', err);
    } finally {
      fetchingRef.current = false;
    }
  };

  const startRush = async () => {
    setIsLoading(true);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAttempts(0);
    setTimeLeft(60);
    setIsNewHighScore(false);
    setPuzzleQueue([]);
    
    // Initial fetch
    const { min, max } = DIFFICULTY_MAP[difficulty];
    const rating = (min + max) / 2;
    try {
      const res = await fetch(`/api/puzzle/blitz?rating=${rating}`);
      const data = await res.json();
      if (data.puzzles && data.puzzles.length > 0) {
        const first = data.puzzles[0];
        setPuzzleQueue(data.puzzles.slice(1));
        applyPuzzle(first);
        setGamePhase('playing');
      }
    } catch (err) {
      console.error('Failed to start rush:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPuzzle = (puzzle: PuzzleData) => {
    setCurrentPuzzle(puzzle);
    const newChess = new Chess(puzzle.fen);
    setChess(newChess);
    setFlash(null);
    setMove([]);
    setAnimation(true);

    // Opponent move after 300ms
    setTimeout(() => {
      const { from, to, promotion } = fromUCI(puzzle.opponentMove);
      newChess.move({ from, to, promotion });
      setChess(new Chess(newChess.fen()));
      setMove([formatSquare(from), formatSquare(to)]);
    }, 300);
  };

  const handlePlayerMove = (previousFen: string, movement: { from: string, to: string, promotion?: PieceSymbol }, anim: boolean) => {
    if (gamePhase !== 'playing' || !currentPuzzle || flash) return;

    const expectedUCI = currentPuzzle.solution[0];
    const isCorrect = isCorrectMove(movement, expectedUCI);

    setTotalAttempts(prev => prev + 1);

    if (isCorrect) {
      const newChess = new Chess(chess.fen());
      newChess.move(movement);
      setChess(newChess);
      setMove([formatSquare(movement.from), formatSquare(movement.to)]);
      setAnimation(anim);
      setFlash('green');
      setScore(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });

      setTimeout(() => advancePuzzle(), 300);
    } else {
      setFlash('red');
      setStreak(0);
      setTimeout(() => advancePuzzle(), 500);
    }
  };

  const advancePuzzle = () => {
    if (timeLeft <= 0) return;
    
    if (puzzleQueue.length > 0) {
      const next = puzzleQueue[0];
      setPuzzleQueue(prev => prev.slice(1));
      applyPuzzle(next);
    } else {
      // If queue is empty (shouldn't happen with pre-fetching), end game or wait
      setIsLoading(true);
      fetchPuzzles().then(() => {
        setIsLoading(false);
      });
    }
  };

  const endGame = () => {
    setGamePhase('post');
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Handle high score
    const currentHighScore = localStorage.getItem(`blitz_highscore_${difficulty}`);
    const scoreNum = score;
    if (!currentHighScore || scoreNum > parseInt(currentHighScore)) {
      localStorage.setItem(`blitz_highscore_${difficulty}`, scoreNum.toString());
      setHighScore(scoreNum);
      setIsNewHighScore(true);
    }
  };

  const abortRush = () => {
    endGame();
  };

  const isWhite = currentPuzzle ? (new Chess(currentPuzzle.fen).turn() === 'b') : true;

  // Render Pre-game
  if (gamePhase === 'pre') {
    return (
      <main className="flex flex-col items-center justify-center h-full w-full bg-backgroundBox p-6">
        <div className="max-w-md w-full bg-backgroundBoxBox p-8 rounded-borderRoundness border-border border-[1px] shadow-xl flex flex-col items-center gap-6">
          <h1 className="text-5xl font-black text-white italic">⚡ Puzzle Rush</h1>
          <p className="text-foregroundGrey text-center text-lg">
            Solve as many 1-move puzzles as you can in 60 seconds.
          </p>
          
          <div className="flex flex-col w-full gap-2">
            <span className="text-xs font-bold text-foregroundGrey uppercase tracking-widest px-1">Difficulty</span>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-borderRoundness font-bold transition-all border-[1px] ${
                    difficulty === d 
                    ? 'bg-backgroundBoxBoxHighlighted border-white text-white shadow-shadowBoxBoxHighlighted' 
                    : 'bg-backgroundBox border-border text-foregroundGrey hover:bg-backgroundBoxBoxHover'
                  }`}
                >
                  {DIFFICULTY_MAP[d].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 bg-backgroundBox p-4 rounded-borderRoundness w-full border-border border-[1px]">
            <span className="text-xs font-bold text-foregroundGrey uppercase">Your High Score</span>
            <span className="text-4xl font-black text-foregroundHighlighted">{highScore}</span>
          </div>

          <button
            onClick={startRush}
            disabled={isLoading}
            className="w-full bg-winGreen hover:opacity-90 text-white py-5 rounded-borderRoundness font-black text-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Start Rush'}
          </button>
        </div>
      </main>
    );
  }

  // Render Post-game
  if (gamePhase === 'post') {
    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
    return (
      <main className="flex flex-col items-center justify-center h-full w-full bg-backgroundBox p-6">
        <div className="max-w-md w-full bg-backgroundBoxBox p-8 rounded-borderRoundness border-border border-[1px] shadow-xl flex flex-col items-center gap-8 relative overflow-hidden">
          {isNewHighScore && (
            <div className="absolute top-4 -right-12 bg-winGreen text-white px-12 py-1 rotate-45 font-black text-xs shadow-md">
              NEW RECORD
            </div>
          )}
          
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-foregroundGrey font-bold uppercase tracking-[0.2em]">Time's Up!</h2>
            <div className="flex flex-col items-center">
              <span className="text-8xl font-black text-white">{score}</span>
              <span className="text-foregroundGrey font-bold">Puzzles Solved</span>
            </div>
          </div>

          {isNewHighScore && (
            <div className="bg-winGreen/20 border-winGreen border-[1px] p-4 rounded-borderRoundness w-full flex items-center justify-center gap-3 animate-bounce">
              <span className="text-2xl">🏆</span>
              <span className="text-winGreen font-bold">New High Score!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-backgroundBox p-4 rounded-borderRoundness border-border border-[1px] flex flex-col items-center">
              <span className="text-[10px] font-bold text-foregroundGrey uppercase">Best Streak</span>
              <span className="text-2xl font-black text-white">🔥 {bestStreak}</span>
            </div>
            <div className="bg-backgroundBox p-4 rounded-borderRoundness border-border border-[1px] flex flex-col items-center">
              <span className="text-[10px] font-bold text-foregroundGrey uppercase">Accuracy</span>
              <span className="text-2xl font-black text-white">{accuracy}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={startRush}
              className="w-full bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover text-white py-4 rounded-borderRoundness font-extrabold text-xl transition-all shadow-shadowBoxBoxHighlighted"
            >
              Play Again
            </button>
            <Link 
              href="/puzzles"
              className="w-full bg-backgroundBox hover:bg-backgroundBoxBoxHover text-foregroundGrey py-4 rounded-borderRoundness font-bold text-center border-border border-[1px] transition-all"
            >
              Back to Puzzles
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Render Game
  const timerColorClass = timeLeft < 10 ? 'text-lossRed animate-pulse' : timeLeft < 20 ? 'text-orange-500' : 'text-white';
  const progressWidth = (timeLeft / 60) * 100;

  return (
    <main className="flex flex-col vertical:flex-row h-full vertical:p-4 p-2 vertical:gap-6 gap-4 items-center vertical:items-stretch vertical:justify-center select-none w-full overflow-x-hidden overflow-y-auto bg-background">
      
      {/* Board Area */}
      <div className="flex flex-col items-center justify-center gap-4 relative vertical:flex-grow">
        <BoardContainer
          widthPadding={typeof window !== 'undefined' && window.innerWidth > 516 ? 500 : 40}
          heightPadding={80}
          maxSize={900}
        >
          {(size) => (
            <div className="relative rounded-borderRoundness overflow-hidden shadow-2xl border-4 border-backgroundBox bg-backgroundBox">
              <Board
                boardSize={size}
                fen={chess.fen()}
                nextFen={chess.fen()}
                move={move}
                forward={forward}
                white={isWhite}
                animation={animation}
                gameEnded={false}
                setAnimation={setAnimation}
                result={''}
                arrows={[]}
                pushArrow={() => { }}
                cleanArrows={() => { }}
                analyzeMove={handlePlayerMove}
                analyzingMove={false}
                setMaterialAdvantage={() => { }}
                drag={drag}
                setDrag={setDrag}
                setPlaying={() => { }}
              />

              {flash === 'green' && <div className="absolute inset-0 bg-green-500/30 z-[110] pointer-events-none animate-pulse" />}
              {flash === 'red' && <div className="absolute inset-0 bg-red-500/30 z-[110] pointer-events-none animate-pulse" />}
            </div>
          )}
        </BoardContainer>
      </div>

      {/* HUD Panel */}
      <div className="vertical:h-full w-full max-w-[400px] pb-8 vertical:pb-0 vertical:min-h-0 select-text bg-backgroundBox rounded-borderRoundness flex flex-col gap-6 overflow-hidden border-border border-[1px] p-6 shadow-xl">
        
        {/* Timer Section */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-foregroundGrey uppercase tracking-widest">Time Remaining</span>
            <span className={`text-4xl font-black font-mono transition-colors ${timerColorClass}`}>
              0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>
          <div className="w-full h-3 bg-backgroundBoxBox rounded-full overflow-hidden border-border border-[1px]">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-lossRed' : timeLeft < 20 ? 'bg-orange-500' : 'bg-backgroundBoxBoxHighlighted'}`} 
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        {/* Score Section */}
        <div className="bg-backgroundBoxBox p-6 rounded-borderRoundness border-border border-[1px] flex flex-col items-center gap-1 shadow-inner">
          <span className="text-xs font-bold text-foregroundGrey uppercase tracking-widest">Current Score</span>
          <span className="text-6xl font-black text-white">{score}</span>
          {streak > 0 && (
            <div className="mt-2 bg-backgroundBox p-2 px-4 rounded-full border-border border-[1px] flex items-center gap-2 animate-bounce">
              <span className="text-sm">🔥</span>
              <span className="text-sm font-bold text-foregroundHighlighted">{streak} in a row</span>
            </div>
          )}
        </div>

        {/* Puzzle Info */}
        {currentPuzzle && (
          <div className="flex flex-col gap-4 bg-backgroundBoxBox p-4 rounded-borderRoundness border-border border-[1px]">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foregroundGrey uppercase">Puzzle Rating</span>
                <span className="text-xl font-black text-white">{currentPuzzle.rating}</span>
              </div>
              <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                {currentPuzzle.themes.slice(0, 2).map(t => (
                  <span key={t} className="bg-backgroundBoxBoxHover text-foregroundGrey px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider">
                    {t.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-border/50">
          <button
            onClick={abortRush}
            className="w-full bg-[#2a1a1a] hover:bg-[#3d1a1a] text-lossRed py-4 rounded-borderRoundness font-bold transition-all border-lossRed border-[1px]"
          >
            End Rush
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-backgroundBoxBoxHighlighted border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </main>
  );
}
