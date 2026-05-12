'use client';

import React from 'react';
import { PuzzleStats } from '@/utils/puzzle-logic';
import Image from 'next/image';

interface PuzzleStatsViewProps {
  stats: PuzzleStats;
}

export default function PuzzleStatsView({ stats }: PuzzleStatsViewProps) {
  const solvedToday = stats.dailySolvedIds.length;
  const successRate = stats.totalAttempts > 0 
    ? Math.round((stats.totalSolved / stats.totalAttempts) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-xl font-bold text-white px-1">Your Progress</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-backgroundBoxBox p-4 rounded-borderRoundness flex flex-col gap-1 border-border border-[1px]">
          <span className="text-xs font-bold text-foregroundGrey flex items-center gap-1">
            <Image alt="solved" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/quick.svg`} width={12} height={12} />
            SOLVED TODAY
          </span>
          <span className="text-2xl font-extrabold text-white">{solvedToday}</span>
        </div>
        
        <div className="bg-backgroundBoxBox p-4 rounded-borderRoundness flex flex-col gap-1 border-border border-[1px]">
          <span className="text-xs font-bold text-foregroundGrey flex items-center gap-1">
            <Image alt="streak" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/deep.svg`} width={12} height={12} />
            STREAK
          </span>
          <span className="text-2xl font-extrabold text-highlightBest">{stats.streak}</span>
        </div>
        
        <div className="bg-backgroundBoxBox p-4 rounded-borderRoundness flex flex-col gap-1 border-border border-[1px]">
          <span className="text-xs font-bold text-foregroundGrey flex items-center gap-1">
            <Image alt="accuracy" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/standard.svg`} width={12} height={12} />
            ACCURACY
          </span>
          <span className="text-2xl font-extrabold text-winGreen">{successRate}%</span>
        </div>
        
        <div className="bg-backgroundBoxBox p-4 rounded-borderRoundness flex flex-col gap-1 border-border border-[1px]">
          <span className="text-xs font-bold text-foregroundGrey flex items-center gap-1">
            <Image alt="total" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/logo.svg`} width={12} height={12} />
            TOTAL SOLVED
          </span>
          <span className="text-2xl font-extrabold text-white">{stats.totalSolved}</span>
        </div>
      </div>
    </div>
  );
}
