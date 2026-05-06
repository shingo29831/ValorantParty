// src/components/PlayerCard.tsx
// AI Role: プレイヤーの生成結果カードUI
// 役割: 各プレイヤーに割り当てられたエージェント、武器、ランクなどを表示する結果画面用カードコンポーネント

import React, { useState } from 'react';
import { PlayerResult } from '../types';
import { RoleIcon } from './RoleIcon';
import { getImagePath, getRankImagePath } from '../utils/imageUtils';

interface Props {
  player: PlayerResult;
  isDefender: boolean;
}

export const PlayerCard: React.FC<Props> = ({ player, isDefender }) => {
  const [agentImgError, setAgentImgError] = useState(false);
  const borderColor = isDefender ? 'border-blue-500/50' : 'border-val-red/50';
  const hoverColor = isDefender ? 'hover:border-blue-400' : 'hover:border-red-400';
  const weaponCount = (player.mainWeapon ? 1 : 0) + (player.subWeapon ? 1 : 0);

  return (
    <div className={`bg-black/60 border ${borderColor} ${hoverColor} transition-colors flex flex-col h-full overflow-hidden relative group`}>
      <div className="p-1.5 md:p-2 flex justify-between items-center bg-val-dark z-10 border-b border-val-gray/20">
        <div className="font-bold text-sm md:text-base truncate pr-1 text-white">{player.name}</div>
        {player.rank !== 'None' && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] md:text-xs font-bold bg-val-gray/20 px-1.5 py-0.5 text-val-light shrink-0 rounded whitespace-nowrap">
              {player.rank === 'Radiant' ? player.rank : `${player.rank} ${player.tier}`}
            </span>
          </div>
        )}
      </div>

      {weaponCount > 0 && (
        <div className={`p-1 z-10 bg-val-dark/90 border-b border-val-gray/20 grid gap-1 ${weaponCount === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {player.mainWeapon && (
            <div className="w-full aspect-video bg-black/40 rounded-sm overflow-hidden relative flex items-center justify-center">
              <img src={getImagePath('weapons', player.mainWeapon)} alt={player.mainWeapon} className="w-full h-full object-contain p-0.5" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="absolute bottom-0 left-0 bg-black/70 text-[9px] md:text-[11px] px-1 text-val-light font-bold truncate max-w-full">{player.mainWeapon}</span>
            </div>
          )}
          {player.subWeapon && (
            <div className="w-full aspect-video bg-black/40 rounded-sm overflow-hidden relative flex items-center justify-center">
              <img src={getImagePath('weapons', player.subWeapon)} alt={player.subWeapon} className="w-full h-full object-contain p-0.5" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="absolute bottom-0 left-0 bg-black/70 text-[8px] md:text-[10px] px-1 text-val-light font-bold truncate max-w-full">{player.subWeapon}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 w-full relative mt-auto bg-black/20 overflow-hidden flex items-end justify-center aspect-[2/3]">
        {player.rank !== 'None' && (
          <div className="absolute top-1 left-1 md:top-2 md:left-2 z-20 pointer-events-none">
            <img 
              src={getRankImagePath(player.rank, player.tier)} 
              alt={player.rank} 
              className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-lg"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
        )}
        
        {player.agent ? (
          <>
            {!agentImgError ? (
              <img
                src={getImagePath('agents', player.agent)}
                alt={player.agent}
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                onError={() => setAgentImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-yellow-400 font-bold text-sm md:text-base uppercase tracking-widest bg-black/50 px-2 py-1 rounded">{player.agent}</span>
              </div>
            )}
            {player.role && (
              <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-val-dark/80 p-1 md:p-1.5 rounded-full border border-val-gray/30">
                <RoleIcon role={player.role} className="w-4 h-4 md:w-5 md:h-5 text-white opacity-90 drop-shadow-md" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 md:gap-4 bg-val-dark/50">
            {player.role && (
              <>
                <RoleIcon role={player.role} className="w-12 h-12 md:w-20 md:h-20 text-val-light opacity-80 drop-shadow-lg" />
                <span className="text-val-light font-bold text-sm md:text-base uppercase tracking-widest">{player.role}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};