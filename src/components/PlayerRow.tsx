// src/components/PlayerRow.tsx
// AI Role: プレイヤー設定行UIコンポーネント
// 役割: 各プレイヤーの名前、ランク、希望ロール、固定チームを設定する入力UIを提供する

import React from 'react';
import { Player, Rank, Tier, Role, Team, RandomizerConfig } from '../types';
import { ROLES } from '../constants/valorant';
import { RoleIcon } from './RoleIcon';
import { RankSelector } from './RankSelector';

interface Props {
  player: Player;
  index: number;
  config: RandomizerConfig;
  t: Record<string, string>;
  onUpdateName: (index: number, name: string) => void;
  onUpdateRank: (index: number, rank: Rank) => void;
  onUpdateTier: (index: number, tier: Tier) => void;
  onToggleRole: (index: number, role: Role) => void;
  onToggleTeam: (index: number, team: Team) => void;
}

export const PlayerRow: React.FC<Props> = ({
  player,
  index,
  config,
  t,
  onUpdateName,
  onUpdateRank,
  onUpdateTier,
  onToggleRole,
  onToggleTeam,
}) => {
  return (
    <div className="bg-black/40 p-2 md:p-3 border border-val-gray/20 focus-within:border-val-red transition-colors flex items-center gap-2 md:gap-3">
      <span className="text-val-gray font-bold w-5 md:w-6 text-base md:text-lg text-right shrink-0">
        {index + 1}.
      </span>

      {!config.autoTeams && (
        <button
          onClick={() => onToggleTeam(index, player.fixedTeam === 'Team 1' ? 'Team 2' : 'Team 1')}
          className={`p-1.5 text-xs md:text-sm font-bold w-8 md:w-10 rounded shrink-0 transition-colors ${
            player.fixedTeam === 'Team 1' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
          }`}
          title="Click to change team"
        >
          {player.fixedTeam === 'Team 1' ? 'T1' : 'T2'}
        </button>
      )}

      <input
        type="text"
        value={player.name}
        onChange={(e) => onUpdateName(index, e.target.value)}
        className="bg-transparent border-b border-val-gray/50 focus:border-val-red outline-none px-2 py-1 flex-1 text-base md:text-lg min-w-[80px]"
        placeholder={t.playerName}
      />

      <div className="flex gap-1.5 md:gap-2 shrink-0 items-center">
        <RankSelector 
          rank={player.rank}
          tier={player.tier}
          onUpdateRank={(rank) => onUpdateRank(index, rank)}
          onUpdateTier={(tier) => onUpdateTier(index, tier)}
          t={t}
        />
      </div>

      <div className="flex gap-1 md:gap-1.5 items-center bg-black/30 p-1 md:p-1.5 rounded border border-val-gray/30 shrink-0">
        {ROLES.map((role) => {
          // 修正箇所: ランダムロール(restrictRoles)が有効なら強制的に選択状態にし、操作不能にする
          const isSelected = config.restrictRoles || player.preferredRoles.includes(role);
          const isDisabled = config.restrictRoles;

          return (
            <button
              key={role}
              onClick={() => onToggleRole(index, role)}
              disabled={isDisabled}
              className={`p-1.5 md:p-2 rounded transition-colors ${
                isSelected
                  ? 'bg-val-red/80 text-white shadow-[0_0_8px_rgba(255,70,85,0.6)]'
                  : 'bg-transparent text-val-gray hover:bg-val-gray/20 hover:text-white'
              } ${isDisabled ? 'cursor-not-allowed opacity-80' : ''}`}
              title={isDisabled ? 'Random Role Enabled' : role}
            >
              <RoleIcon role={role} className="w-4 h-4 md:w-5 md:h-5 drop-shadow-md" />
            </button>
          );
        })}
      </div>
    </div>
  );
};