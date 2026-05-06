// src/components/RankSelector.tsx
// AI Role: ランク選択UIコンポーネント
// 役割: プレイヤーのランクとティアを画像ベースのポップアップメニューから選択できるようにする

import React, { useState, useRef, useEffect } from 'react';
import { Rank, Tier } from '../types';
import { getRankImagePath } from '../utils/imageUtils';

interface Props {
  rank: Rank;
  tier: Tier;
  onUpdateRank: (rank: Rank) => void;
  onUpdateTier: (tier: Tier) => void;
  t: Record<string, string>;
}

// なぜ: ポップアップ内に全ランクとティアの組み合わせをグリッド状に並べるため、配列構造を定義
const RANK_ROWS: { rank: Rank; tiers: Tier[] }[] = [
  { rank: 'None', tiers: [1] },
  { rank: 'Iron', tiers: [1, 2, 3] },
  { rank: 'Bronze', tiers: [1, 2, 3] },
  { rank: 'Silver', tiers: [1, 2, 3] },
  { rank: 'Gold', tiers: [1, 2, 3] },
  { rank: 'Platinum', tiers: [1, 2, 3] },
  { rank: 'Diamond', tiers: [1, 2, 3] },
  { rank: 'Ascendant', tiers: [1, 2, 3] },
  { rank: 'Immortal', tiers: [1, 2, 3] },
  { rank: 'Radiant', tiers: [1] },
];

export const RankSelector: React.FC<Props> = ({ rank, tier, onUpdateRank, onUpdateTier, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // なぜ: ポップアップの外側をクリックしたときにメニューを閉じるため
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedRank: Rank, selectedTier: Tier) => {
    onUpdateRank(selectedRank);
    onUpdateTier(selectedTier);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-1 md:p-1.5 hover:bg-black/30 rounded border border-transparent hover:border-val-gray/50 transition-colors bg-black/20"
        title={rank === 'None' ? t.unranked : `${rank} ${rank !== 'Radiant' ? tier : ''}`}
      >
        <img
          src={getRankImagePath(rank, tier)}
          alt={rank}
          className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-md"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-val-dark/95 backdrop-blur-sm border border-val-gray/30 p-3 rounded-lg shadow-2xl z-50 min-w-[200px] md:min-w-[240px]">
          <div className="flex flex-col gap-2 md:gap-3 max-h-[40vh] md:max-h-[50vh] overflow-y-auto px-1 py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-val-gray/50 [&::-webkit-scrollbar-thumb]:rounded-full">
            {RANK_ROWS.map((row) => (
              <div key={row.rank} className={`flex gap-2 md:gap-3 justify-center ${row.tiers.length === 1 ? 'py-1' : ''}`}>
                {row.tiers.map((tVal) => {
                  const isSelected = rank === row.rank && (row.tiers.length === 1 || tier === tVal);
                  return (
                    <button
                      key={`${row.rank}-${tVal}`}
                      onClick={() => handleSelect(row.rank, tVal)}
                      className={`p-1 md:p-1.5 rounded transition-colors border group relative ${isSelected ? 'bg-white/10 border-white/30' : 'border-transparent hover:bg-white/10 hover:border-white/20'}`}
                      title={`${row.rank} ${row.tiers.length > 1 ? tVal : ''}`.trim()}
                    >
                      <img
                        src={getRankImagePath(row.rank, tVal)}
                        alt={`${row.rank} ${tVal}`}
                        className={`w-8 h-8 md:w-10 md:h-10 object-contain transition-transform group-hover:scale-110 ${isSelected ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] scale-110' : 'opacity-70 group-hover:opacity-100'}`}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* なぜ: 吹き出しのような下向きの矢印（しっぽ）を描画するため */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-val-gray/30"></div>
          <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 border-8 border-transparent border-t-val-dark/95"></div>
        </div>
      )}
    </div>
  );
};