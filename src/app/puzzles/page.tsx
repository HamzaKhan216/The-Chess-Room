'use client';

import React, { useEffect, useState, useRef } from 'react';
import Board, { drag } from '@/components/game/board';

import PuzzleFilters from '@/components/puzzle/PuzzleFilters';
import PuzzleStatsView from '@/components/puzzle/PuzzleStats';
import { BoardContainer } from '@/components/game/BoardContainer';
import { PuzzleData, PuzzleStats, getStats, saveStats, fromUCI, isCorrectMove } from '@/utils/puzzle-logic';
import { Chess, Square } from 'chess.js';
import { formatSquare, square } from '@/engine/stockfish';
import { PieceSymbol } from 'chess.js';

const navTop = 516; // From tailwind.config.ts

export default function PuzzlesPage() {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [puzzleBuffer, setPuzzleBuffer] = useState<PuzzleData[]>([]);
  const [chess, setChess] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [status, setStatus] = useState<'loading' | 'playing' | 'solved' | 'failed' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PuzzleStats | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [rating, setRating] = useState(1200);
  const [theme, setTheme] = useState<string | null>(null);
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);
  const [drag, setDrag] = useState<drag>({ is: false, id: '' });
  const [animation, setAnimation] = useState(true);

  const [hintSquare, setHintSquare] = useState<Square | null>(null);

  const [move, setMove] = useState<square[]>([]);
  const [forward, setForward] = useState(true);


  const fetchingRef = useRef(false);
  const initialFetchRef = useRef(false);
  const sessionPlayedIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!initialFetchRef.current) {
      fetchNewPuzzle();
      initialFetchRef.current = true;
    }
    setStats(getStats());
    setHasMounted(true);
  }, []);

  // Prefetch puzzles in background
  useEffect(() => {
    if (hasMounted && puzzleBuffer.length < 2 && !fetchingRef.current) {
      prefetchPuzzles();
    }
  }, [hasMounted, puzzleBuffer.length]);

  const prefetchPuzzles = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      // Limit excludeIds to recent solves + session played + buffer + current puzzle to reduce URL length and avoid repeats
      const recentSolvedIds = stats?.solvedIds || [];
      const currentId = puzzle ? [puzzle.id] : [];
      const bufferIds = puzzleBuffer.map(p => p.id);
      const combinedExcludes = Array.from(new Set([
        ...recentSolvedIds,
        ...sessionPlayedIdsRef.current,
        ...bufferIds,
        ...currentId
      ])).slice(-200);
      const excludeIds = combinedExcludes.join(',');
      
      const res = await fetch(`/api/puzzle?rating=${rating}${theme ? `&theme=${theme}` : ''}${excludeIds ? `&excludeIds=${excludeIds}` : ''}`);
      const data: any = await res.json();

      if (!data.error && data.puzzles && Array.isArray(data.puzzles)) {
        setPuzzleBuffer(prev => [...prev, ...data.puzzles]);
      }
    } catch (err) {
      console.error('Failed to prefetch puzzle', err);
    } finally {
      fetchingRef.current = false;
    }
  };

  const fetchNewPuzzle = async (newRating?: number, newTheme?: string | null) => {
    const r = newRating ?? rating;
    const t = newTheme ?? theme;

    // If filters changed, clear buffer and fetch fresh
    if (newRating !== undefined || newTheme !== undefined) {
      setPuzzleBuffer([]);
      setStatus('loading');
    } else if (puzzleBuffer.length > 0) {
      // Use from buffer
      const data = puzzleBuffer[0];
      setPuzzleBuffer(prev => prev.slice(1));
      applyPuzzle(data);
      return;
    } else {
      setStatus('loading');
    }

    setPuzzle(null);
    setHintSquare(null);
    setCurrentMoveIndex(0);
    setFlash(null);
    setMove([]);

    // Limit excludeIds to recent solves + session played + buffer + current puzzle to reduce URL length and avoid repeats
    const recentSolvedIds = stats?.solvedIds || [];
    const currentId = puzzle ? [puzzle.id] : [];
    const bufferIds = puzzleBuffer.map(p => p.id);
    const combinedExcludes = Array.from(new Set([
      ...recentSolvedIds,
      ...sessionPlayedIdsRef.current,
      ...bufferIds,
      ...currentId
    ])).slice(-200);
    const excludeIds = combinedExcludes.join(',');

    try {
      const res = await fetch(`/api/puzzle?rating=${r}${t ? `&theme=${t}` : ''}${excludeIds ? `&excludeIds=${excludeIds}` : ''}`);
      const data: any = await res.json();

      if (data.error) {
        setError(data.error);
        setStatus('error');
        return;
      }

      // Handle batched response
      if (data.puzzles && Array.isArray(data.puzzles) && data.puzzles.length > 0) {
        const firstPuzzle = data.puzzles[0];
        const remainingPuzzles = data.puzzles.slice(1);
        
        // Store remaining puzzles in buffer for quick access
        if (remainingPuzzles.length > 0) {
          setPuzzleBuffer(remainingPuzzles);
        }
        
        setError(null);
        applyPuzzle(firstPuzzle);
      } else {
        setError('No puzzles available');
        setStatus('error');
      }

    } catch (err) {
      console.error('Failed to fetch puzzle', err);
      setStatus('error');
    }
  };

  const applyPuzzle = (data: PuzzleData) => {
    if (!sessionPlayedIdsRef.current.includes(data.id)) {
      sessionPlayedIdsRef.current.push(data.id);
    }
    setPuzzle(data);
    const newChess = new Chess(data.fen);
    setChess(newChess);
    setStatus('playing');
    setHintSquare(null);
    setCurrentMoveIndex(0);
    setFlash(null);
    setMove([]);

    setTimeout(() => {
      const { from, to, promotion } = fromUCI(data.opponentMove);
      newChess.move({ from, to, promotion });
      setChess(new Chess(newChess.fen()));
      setMove([formatSquare(from), formatSquare(to)]);
      setAnimation(true);
      setForward(true);
    }, 600);
  };

  const handlePlayerMove = (previousFen: string, movement: { from: string, to: string, promotion?: PieceSymbol }, animation: boolean) => {
    if (status !== 'playing' || !puzzle || !stats) return;

    const expectedUCI = puzzle.solution[currentMoveIndex];
    const isCorrect = isCorrectMove(movement, expectedUCI);

    setHintSquare(null);

    if (isCorrect) {
      const newChess = new Chess(chess.fen());
      newChess.move(movement);
      setChess(newChess);
      setMove([formatSquare(movement.from), formatSquare(movement.to)]);
      setAnimation(animation);
      setForward(true);
      setFlash('green');
      setHintSquare(null);

      setTimeout(() => setFlash(null), 500);

      const nextMoveIndex = currentMoveIndex + 1;

      if (nextMoveIndex >= puzzle.solution.length) {
        setStatus('solved');
        const newStats = {
          ...stats,
          totalSolved: stats.totalSolved + 1,
          totalAttempts: stats.totalAttempts + 1,
          streak: stats.streak + 1,
          solvedIds: [...stats.solvedIds, puzzle.id],
          dailySolvedIds: [...stats.dailySolvedIds, puzzle.id],
          lastSolvedDate: new Date().toISOString()
        };
        setStats(newStats);
        saveStats(newStats);
      } else {
        setCurrentMoveIndex(nextMoveIndex + 1);
        setTimeout(() => {
          const opponentUCI = puzzle.solution[nextMoveIndex];
          const { from, to, promotion } = fromUCI(opponentUCI);
          newChess.move({ from, to, promotion });
          setChess(new Chess(newChess.fen()));
          setMove([formatSquare(from), formatSquare(to)]);
          setAnimation(true);
          setForward(true);
        }, 400);
      }
    } else {
      setFlash('red');
      const newStats = { ...stats, totalAttempts: stats.totalAttempts + 1 };
      setStats(newStats);
      saveStats(newStats);
      setTimeout(() => setFlash(null), 500);
    }
  };

  const handleGiveUp = async () => {
    if (!puzzle || status !== 'playing' || !stats) return;
    setStatus('failed');
    setStats({ ...stats, streak: 0 });

    const tempChess = new Chess(chess.fen());
    for (let i = currentMoveIndex; i < puzzle.solution.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const { from, to, promotion } = fromUCI(puzzle.solution[i]);
      tempChess.move({ from, to, promotion });
      setChess(new Chess(tempChess.fen()));
      setMove([formatSquare(from), formatSquare(to)]);
      setAnimation(true);
      setForward(true);
    }
  };

  const handleHint = () => {
    if (!puzzle || status !== 'playing') return;
    const expectedUCI = puzzle.solution[currentMoveIndex];
    const { from } = fromUCI(expectedUCI);
    setHintSquare(from);
  };

  const isWhite = puzzle ? (new Chess(puzzle.fen).turn() === 'b') : true;

  return (
    <main className="flex flex-col vertical:flex-row h-full vertical:p-4 p-2 vertical:gap-6 gap-4 items-center vertical:items-stretch vertical:justify-center select-none w-full overflow-x-hidden overflow-y-auto">

      {status === 'error' && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center gap-4 bg-backgroundBox p-8 rounded-borderRoundness shadow-lg border-border border-[1px]">
            <span className="text-lossRed text-xl font-bold">Failed to load puzzle</span>
            <span className="text-foregroundGrey">{error || 'Unknown error occurred'}</span>
            <button onClick={() => fetchNewPuzzle()} className="bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover px-8 py-3 rounded-borderRoundness text-white font-bold transition-all shadow-lg">Retry</button>
          </div>
        </div>
      )}

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[600px]">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-backgroundBoxBoxHighlighted border-t-transparent rounded-full animate-spin shadow-lg" />
            <span className="text-foregroundGrey font-bold animate-pulse text-lg">Fetching puzzle...</span>
          </div>
        </div>
      )}

      {status !== 'loading' && status !== 'error' && (
        <div className="flex flex-col items-center justify-center gap-4 relative vertical:flex-grow">
          {status === 'solved' && (
            <div className="absolute top-[-50px] z-[100] animate-bounce">
              <span className="bg-winGreen text-white px-6 py-2 rounded-full font-bold text-xl shadow-lg border-2 border-white/20">
                Puzzle Solved!
              </span>
            </div>
          )}

          <BoardContainer
            widthPadding={typeof window !== 'undefined' && window.innerWidth > navTop ? 500 : 40}
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
                  gameEnded={status === 'solved'}
                  setAnimation={setAnimation}
                  result={status === 'solved' ? (isWhite ? '1-0' : '0-1') : ''}
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

                {hintSquare && (
                  <div
                    className="absolute z-[105] bg-yellow-400/40 rounded-full border-4 border-yellow-400 animate-ping pointer-events-none"
                    style={{
                      width: size / 8,
                      height: size / 8,
                      left: isWhite
                        ? (hintSquare.charCodeAt(0) - 97) * (size / 8)
                        : (7 - (hintSquare.charCodeAt(0) - 97)) * (size / 8),
                      top: isWhite
                        ? (8 - parseInt(hintSquare[1])) * (size / 8)
                        : (parseInt(hintSquare[1]) - 1) * (size / 8),
                    }}
                  />
                )}
              </div>
            )}
          </BoardContainer>

          {puzzle && (
            <div className="flex gap-2 mt-4">
              {puzzle.solution.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i < currentMoveIndex ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {status !== 'loading' && status !== 'error' && (
        <div className="vertical:h-full w-full max-w-[500px] pb-8 vertical:pb-0 vertical:min-h-0 min-h-[600px] select-text bg-backgroundBox rounded-borderRoundness flex flex-col gap-6 overflow-hidden border-border border-[1px] p-6 shadow-xl">

          {puzzle && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-backgroundBoxBox p-4 rounded-borderRoundness border-border border-[1px]">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foregroundGrey">PUZZLE RATING</span>
                  <span className="text-3xl font-black text-white">{puzzle.rating}</span>
                </div>
                <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                  {puzzle.themes.slice(0, 3).map(t => (
                    <span key={t} className="bg-backgroundBoxBoxHover text-foregroundGrey px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      {t.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleHint}
                  disabled={status !== 'playing'}
                  className="flex items-center justify-center gap-2 bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover text-white py-4 rounded-borderRoundness font-bold transition-all disabled:opacity-50 border-border border-[1px] hover:text-foregroundHighlighted"
                >
                  Hint
                </button>
                <button
                  onClick={handleGiveUp}
                  disabled={status !== 'playing'}
                  className="flex items-center justify-center gap-2 bg-[#2a1a1a] hover:bg-[#3d1a1a] text-lossRed py-4 rounded-borderRoundness font-bold transition-all disabled:opacity-50 border-lossRed border-[1px]"
                >
                  Give Up
                </button>
              </div>

              {(status === 'solved' || status === 'failed') && (
                <button
                  onClick={() => fetchNewPuzzle()}
                  className="w-full bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover text-white py-4 rounded-borderRoundness font-extrabold text-xl transition-all animate-pulse shadow-shadowBoxBoxHighlighted"
                >
                  Next Puzzle
                </button>
              )}
            </div>
          )}

          <div className="h-[1px] bg-border w-full opacity-50" />

          {hasMounted && (
            <PuzzleFilters
              currentRating={rating}
              currentTheme={theme}
              onFilterChange={(r, t) => {
                setRating(r);
                setTheme(t);
                fetchNewPuzzle(r, t);
              }}
            />
          )}

          <div className="h-[1px] bg-border w-full opacity-50" />

          <div className="flex-grow overflow-y-auto pr-1">
            {stats && <PuzzleStatsView stats={stats} />}
          </div>
        </div>
      )}
    </main>
  );
}
