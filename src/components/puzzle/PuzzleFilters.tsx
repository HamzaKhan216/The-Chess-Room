'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Arrow from '../svg/arrow';

const THEMES = [
  { id: 'fork', label: 'Fork' },
  { id: 'pin', label: 'Pin' },
  { id: 'skewer', label: 'Skewer' },
  { id: 'backRankMate', label: 'Back Rank Mate' },
  { id: 'discoveredAttack', label: 'Discovered Attack' },
  { id: 'mateIn1', label: 'Mate in 1' },
  { id: 'mateIn2', label: 'Mate in 2' },
  { id: 'endgame', label: 'Endgame' },
  { id: 'promotion', label: 'Promotion' },
];

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner (600-1000)', range: [600, 1000] },
  { id: 'intermediate', label: 'Intermediate (1000-1400)', range: [1000, 1400] },
  { id: 'advanced', label: 'Advanced (1400-1800)', range: [1400, 1800] },
  { id: 'expert', label: 'Expert (1800+)', range: [1800, 3000] },
];

interface PuzzleFiltersProps {
  onFilterChange: (rating: number, theme: string | null) => void;
  currentRating: number;
  currentTheme: string | null;
}

export default function PuzzleFilters({ onFilterChange, currentRating, currentTheme }: PuzzleFiltersProps) {
  const [isDiffOpen, setDiffOpen] = useState(false);
  const [isThemeOpen, setThemeOpen] = useState(false);

  const selectedDiff = DIFFICULTIES.find(d => currentRating >= d.range[0] && currentRating <= d.range[1]) || DIFFICULTIES[0];
  const selectedTheme = THEMES.find(t => t.id === currentTheme);

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-xl font-bold text-white px-1">Filters</h3>
      
      {/* Difficulty Dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-foregroundGrey px-1 flex flex-row gap-2 items-center">
            <Image alt="difficulty" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/type.svg`} width={16} height={16} />
            Difficulty
        </label>
        <div className="relative">
            <button 
                type="button" 
                className="flex flex-row gap-2 items-center justify-between w-full h-12 px-4 rounded-borderRoundness text-md bg-backgroundBoxBox border-border border-[1px] hover:border-borderHighlighted hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors font-bold"
                onClick={() => { setDiffOpen(!isDiffOpen); setThemeOpen(false); }}
            >
                {selectedDiff.label}
                <div className={`transition-transform ${isDiffOpen ? "" : "rotate-180"}`}><Arrow class="fill-foregroundGrey" /></div>
            </button>
            
            {isDiffOpen && (
                <ul className="absolute z-[200] w-full mt-1 bg-[#262421] border-border border-[1px] rounded-borderRoundness shadow-2xl overflow-hidden">
                    {DIFFICULTIES.map(d => (
                        <li key={d.id}>
                            <button 
                                className={`w-full text-left px-4 py-3 hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors font-bold ${selectedDiff.id === d.id ? 'text-foregroundHighlighted bg-backgroundBoxBoxHover' : 'text-white'}`}
                                onClick={() => {
                                    onFilterChange(d.range[0] + 200, currentTheme);
                                    setDiffOpen(false);
                                }}
                            >
                                {d.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>

      {/* Theme Dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-foregroundGrey px-1 flex flex-row gap-2 items-center">
            <Image alt="theme" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/formats.svg`} width={16} height={16} />
            Theme
        </label>
        <div className="relative">
            <button 
                type="button" 
                className="flex flex-row gap-2 items-center justify-between w-full h-12 px-4 rounded-borderRoundness text-md bg-backgroundBoxBox border-border border-[1px] hover:border-borderHighlighted hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors font-bold"
                onClick={() => { setThemeOpen(!isThemeOpen); setDiffOpen(false); }}
            >
                {selectedTheme ? selectedTheme.label : 'All Themes'}
                <div className={`transition-transform ${isThemeOpen ? "" : "rotate-180"}`}><Arrow class="fill-foregroundGrey" /></div>
            </button>
            
            {isThemeOpen && (
                <ul className="absolute z-[200] w-full mt-1 bg-[#262421] border-border border-[1px] rounded-borderRoundness shadow-2xl max-h-60 overflow-y-auto">
                    <li>
                        <button 
                            className={`w-full text-left px-4 py-3 hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors font-bold ${!currentTheme ? 'text-foregroundHighlighted bg-backgroundBoxHover' : 'text-white'}`}
                            onClick={() => {
                                onFilterChange(currentRating, null);
                                setThemeOpen(false);
                            }}
                        >
                            All Themes
                        </button>
                    </li>
                    {THEMES.map(t => (
                        <li key={t.id}>
                            <button 
                                className={`w-full text-left px-4 py-3 hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors font-bold ${selectedTheme?.id === t.id ? 'text-foregroundHighlighted bg-backgroundBoxBoxHover' : 'text-white'}`}
                                onClick={() => {
                                    onFilterChange(currentRating, t.id);
                                    setThemeOpen(false);
                                }}
                            >
                                {t.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>

      <button 
        onClick={() => {
            onFilterChange(1200 + Math.floor(Math.random() * 800), null);
            setDiffOpen(false);
            setThemeOpen(false);
        }}
        className="mt-4 w-full h-14 rounded-borderExtraRoundness text-xl bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover transition-all font-extrabold hover:shadow-shadowBoxBoxHighlighted"
      >
        Random Puzzle
      </button>
    </div>
  );
}
