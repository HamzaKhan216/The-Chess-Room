import { Chess, Square } from 'chess.js';

export interface PuzzleData {
  id: string;
  fen: string;
  opponentMove: string; // UCI format
  solution: string[];   // UCI format
  rating: number;
  themes: string[];
}

export interface PuzzleStats {
  solvedIds: string[];
  dailySolvedIds: string[];
  streak: number;
  totalAttempts: number;
  totalSolved: number;
  lastSolvedDate: string;
}

export function getStats(): PuzzleStats {
  if (typeof window === 'undefined') return defaultStats();
  const saved = localStorage.getItem('puzzle_stats');
  if (saved) {
    try {
      const stats = JSON.parse(saved);
      // Reset streak if last solved was not today or yesterday
      const lastDate = new Date(stats.lastSolvedDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      lastDate.setHours(0,0,0,0);
      
      const diff = today.getTime() - lastDate.getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (diff >= oneDay) {
        stats.dailySolvedIds = [];
        if (diff > oneDay * 2) {
            stats.streak = 0;
        }
      }
      return stats;
    } catch (e) {
      return defaultStats();
    }
  }
  return defaultStats();
}

function defaultStats(): PuzzleStats {
  return {
    solvedIds: [],
    dailySolvedIds: [],
    streak: 0,
    totalAttempts: 0,
    totalSolved: 0,
    lastSolvedDate: new Date().toISOString(),
  };
}

export function saveStats(stats: PuzzleStats) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('puzzle_stats', JSON.stringify(stats));
}

export function toUCI(from: string, to: string, promotion?: string): string {
  return `${from}${to}${promotion || ''}`;
}

export function fromUCI(uci: string): { from: Square; to: Square; promotion?: string } {
  return {
    from: uci.substring(0, 2) as Square,
    to: uci.substring(2, 4) as Square,
    promotion: uci.substring(4) || undefined,
  };
}

export function isCorrectMove(move: { from: string; to: string; promotion?: string }, expectedUCI: string): boolean {
  const playerUCI = toUCI(move.from, move.to, move.promotion);
  return playerUCI === expectedUCI;
}
