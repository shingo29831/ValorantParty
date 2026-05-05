// src/App.tsx
// AI Role: メインUIの提供
// 役割: App.tsxの肥大化を防ぐため、RoleIconとWeightControllerを別ファイルへ分割

import React, { useState, useRef } from 'react';
import { generateMatch, getRankWeight } from './logic/randomizer';
import { validateTeamCreation } from './logic/validator';
import { Player, PlayerResult, RandomizerConfig, AdvancedConfig, Rank, Tier, Role, Team, MatchResult } from './types';
import { RANKS, ROLES, MAPS, MAIN_WEAPONS, SUB_WEAPONS, AGENTS, AGENT_ROLES } from './constants/valorant';
import { Swords, Shield, Settings2, Users, ArrowLeft, RefreshCw, Globe, SlidersHorizontal, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import { RoleIcon } from './components/RoleIcon';
import { WeightController } from './components/WeightController';

import jaTranslation from './locales/ja.json';
import enTranslation from './locales/en.json';

const TRANSLATIONS = {
  ja: jaTranslation,
  en: enTranslation
};

const INITIAL_PLAYERS: Player[] = Array.from({ length: 10 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Player ${i + 1}`,
  rank: 'None',
  tier: 2,
  fixedTeam: i < 5 ? 'Team 1' : 'Team 2',
  preferredRoles: [],
}));

const getImagePath = (category: 'agents' | 'weapons' | 'maps', name: string) => {
  const safeName = name.replace('/', '');
  return `/images/${category}/${safeName}.png`;
};

const getRankImagePath = (rank: Rank, tier: Tier) => {
  if (rank === 'None') return '';
  if (rank === 'Radiant') return '/images/ranks/Radiant_Rank.png';
  return `/images/ranks/${rank}_${tier}_Rank.png`;
};

const AdvancedItemCard: React.FC<{
  item: string;
  category: 'maps' | 'weapons' | 'agents';
  isBanned: boolean;
  currentWeight: number;
  totalActiveWeight: number;
  onToggleBan: () => void;
  onUpdateWeight: (weight: number) => void;
  t: Record<string, string>;
}> = ({ item, category, isBanned, currentWeight, totalActiveWeight, onToggleBan, onUpdateWeight, t }) => {
  const [imgError, setImgError] = useState(false);
  const aspectClass = category === 'agents' ? 'aspect-[2/3]' : 'aspect-video';
  const bgClass = category === 'maps' ? 'bg-white' : 'bg-black/50';
  
  const probability = (!isBanned && totalActiveWeight > 0) 
    ? ((currentWeight / totalActiveWeight) * 100).toFixed(1) 
    : "0.0";
  
  return (
    <div className={`flex flex-col gap-1.5 md:gap-2 p-1.5 md:p-2 rounded border transition-colors ${isBanned ? 'bg-red-900/20 border-val-red/50 opacity-60 hover:opacity-100' : 'bg-val-dark border-val-gray/20 hover:border-val-gray/50'}`}>
      <div className={`w-full ${aspectClass} ${bgClass} rounded-sm overflow-hidden relative flex items-center justify-center group cursor-pointer`} onClick={onToggleBan}>
        {!imgError ? (
          <img 
            src={getImagePath(category, item)} 
            alt={item} 
            className={`w-full h-full transition-transform duration-300 group-hover:scale-110 ${category === 'weapons' ? 'object-contain p-1' : 'object-cover object-top'} ${isBanned ? 'grayscale opacity-40' : 'opacity-100'}`} 
            onError={() => setImgError(true)} 
          />
        ) : (
          <span className={`text-val-gray text-[10px] md:text-xs font-bold uppercase break-all px-1 text-center ${isBanned ? 'opacity-40' : ''}`}>{item}</span>
        )}
        
        {isBanned && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
            <Ban className="w-8 h-8 text-val-red drop-shadow-md" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5 pt-6 pointer-events-none">
          <div className={`font-bold text-[10px] md:text-[11px] lg:text-xs truncate text-center drop-shadow-md flex items-center justify-center gap-1.5 ${isBanned ? 'text-val-gray line-through' : 'text-white'}`} title={item}>
            <span>{item}</span>
            {!isBanned && <span className="text-[10px] md:text-[11px] lg:text-xs font-mono text-val-light">{probability}%</span>}
          </div>
        </div>
      </div>
      
      <button 
        onClick={onToggleBan}
        className={`text-[9px] md:text-[10px] px-1 py-1 rounded font-bold flex items-center justify-center gap-1 transition-colors ${isBanned ? 'bg-val-red text-white' : 'bg-val-gray/30 hover:bg-val-gray/50 text-val-light'}`}
      >
        <Ban className="w-2.5 h-2.5 md:w-3 md:h-3" /> {isBanned ? 'BANNED' : t.ban}
      </button>
      <div className="flex items-center justify-between gap-1 mt-auto px-1">
        <span className="text-[8px] md:text-[9px] text-val-gray shrink-0">{t.weight}:</span>
        <WeightController value={currentWeight} onChange={onUpdateWeight} disabled={isBanned} variant="full" />
      </div>
    </div>
  );
};

const QuickBanCarousel: React.FC<{
  title: string;
  items: string[];
  category: 'maps' | 'weapons' | 'agents';
  bannedList: string[];
  weights: Record<string, number>;
  onToggle: (item: string) => void;
  onUpdateWeight: (item: string, weight: number) => void;
}> = ({ title, items, category, bannedList, weights, onToggle, onUpdateWeight }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const aspectClass = category === 'agents' ? 'aspect-[2/3]' : 'aspect-video';
  const widthClass = category === 'agents' ? 'w-20 md:w-28' : 'w-28 md:w-44';
  const bgClass = category === 'maps' ? 'bg-white' : 'bg-black/50';

  const activeWeight = items.reduce((sum, item) => bannedList.includes(item) ? sum : sum + (weights[item] ?? 10), 0);
  
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-end px-1 mb-1">
        <span className="text-xs md:text-sm font-bold text-val-gray">{title}</span>
      </div>
      <div className="relative group flex items-center">
        <button 
          onClick={() => scroll('left')} 
          className="absolute left-0 z-20 bg-black/80 hover:bg-val-red p-1 md:p-2 rounded-r opacity-0 group-hover:opacity-100 transition-all shadow-lg"
        >
          <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-white" />
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto gap-3 pb-4 pt-1 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] w-full px-1">
          {items.map(item => {
            const isBanned = bannedList.includes(item);
            const currentWeight = weights[item] ?? 10;
            const [imgError, setImgError] = useState(false);
            
            const probability = (!isBanned && activeWeight > 0) 
              ? ((currentWeight / activeWeight) * 100).toFixed(1) 
              : "0.0";
            
            return (
              <div key={item} className={`shrink-0 snap-start flex flex-col gap-2 ${widthClass} relative`}>
                <button
                  onClick={() => onToggle(item)}
                  className={`relative w-full rounded overflow-hidden border-2 transition-all ${isBanned ? 'border-val-red shadow-[0_0_8px_rgba(255,70,85,0.4)]' : 'border-val-gray/20 hover:border-val-gray/60'} ${aspectClass} ${bgClass}`}
                  title={`${item} (${isBanned ? 'Banned' : 'Active'})`}
                >
                  {!imgError ? (
                    <img
                      src={getImagePath(category, item)}
                      alt={item}
                      className={`w-full h-full transition-transform ${category === 'weapons' ? 'object-contain p-1' : 'object-cover object-top'} ${isBanned ? 'grayscale opacity-40' : 'opacity-100'}`}
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-center p-1">
                      <span className={`text-[8px] md:text-[10px] font-bold uppercase break-all ${isBanned ? 'text-val-gray' : 'text-val-light'}`}>{item}</span>
                    </div>
                  )}
                  
                  {isBanned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/30">
                      <Ban className="w-6 h-6 md:w-8 md:h-8 text-val-red drop-shadow-md" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/70 to-transparent p-1.5 pt-6 pointer-events-none text-center">
                    <div className={`font-bold text-[10px] md:text-xs truncate drop-shadow-md flex items-center justify-center gap-1.5 ${isBanned ? 'text-val-gray line-through' : 'text-white'}`}>
                      <span>{item}</span>
                      {!isBanned && <span className="text-[10px] md:text-xs font-mono text-val-light">{probability}%</span>}
                    </div>
                  </div>
                </button>

                <div className="flex items-center justify-center px-1.5 py-1 bg-black/40 rounded border border-val-gray/30 relative">
                  <WeightController value={currentWeight} onChange={(w) => onUpdateWeight(item, w)} disabled={isBanned} variant="arrows-only" />
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => scroll('right')} 
          className="absolute right-0 z-20 bg-black/80 hover:bg-val-red p-1 md:p-2 rounded-l opacity-0 group-hover:opacity-100 transition-all shadow-lg"
        >
          <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

const PlayerCard: React.FC<{ player: PlayerResult; isDefender: boolean }> = ({ player, isDefender }) => {
  const [agentImgError, setAgentImgError] = useState(false);
  const borderColor = isDefender ? 'border-blue-500/50' : 'border-val-red/50';
  const hoverColor = isDefender ? 'hover:border-blue-400' : 'hover:border-red-400';
  const weaponCount = (player.mainWeapon ? 1 : 0) + (player.subWeapon ? 1 : 0);

  return (
    <div className={`bg-black/60 border ${borderColor} ${hoverColor} transition-colors flex flex-col h-full overflow-hidden relative group`}>
      <div className="p-1 md:p-1.5 flex justify-between items-center bg-val-dark z-10 border-b border-val-gray/20">
        <div className="font-bold text-xs md:text-sm truncate pr-1 text-white">{player.name}</div>
        {player.rank !== 'None' && (
          <div className="flex items-center gap-1">
            <span className="text-[9px] md:text-[10px] font-bold bg-val-gray/20 px-1 py-0.5 text-val-light shrink-0 rounded whitespace-nowrap">
              {player.rank === 'Radiant' ? player.rank : `${player.rank} ${player.tier}`}
            </span>
          </div>
        )}
      </div>

      {weaponCount > 0 && (
        <div className={`p-1 z-10 bg-val-dark/90 border-b border-val-gray/20 grid gap-1 ${weaponCount === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {player.mainWeapon && (
            <div className="w-full aspect-video bg-black/40 rounded-sm overflow-hidden relative flex items-center justify-center">
              <img src={getImagePath('weapons', player.mainWeapon)} alt={player.mainWeapon} className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="absolute bottom-0 left-0 bg-black/70 text-[8px] md:text-[9px] px-1 text-val-light font-bold truncate max-w-full">{player.mainWeapon}</span>
            </div>
          )}
          {player.subWeapon && (
            <div className="w-full aspect-video bg-black/40 rounded-sm overflow-hidden relative flex items-center justify-center">
              <img src={getImagePath('weapons', player.subWeapon)} alt={player.subWeapon} className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="absolute bottom-0 left-0 bg-black/70 text-[7px] md:text-[8px] px-1 text-val-light font-bold truncate max-w-full">{player.subWeapon}</span>
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
              className="w-8 h-8 md:w-12 md:h-12 object-contain drop-shadow-lg"
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
                <span className="text-yellow-400 font-bold text-xs md:text-sm uppercase tracking-widest bg-black/50 px-2 py-1 rounded">{player.agent}</span>
              </div>
            )}
            {player.role && (
              <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-val-dark/80 p-1 md:p-1.5 rounded-full border border-val-gray/30">
                <RoleIcon role={player.role} className="w-3 h-3 md:w-4 md:h-4 text-white opacity-90 drop-shadow-md" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 md:gap-4 bg-val-dark/50">
            {player.role && (
              <>
                <RoleIcon role={player.role} className="w-10 h-10 md:w-16 md:h-16 text-val-light opacity-80 drop-shadow-lg" />
                <span className="text-val-light font-bold text-xs md:text-sm uppercase tracking-widest">{player.role}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const INITIAL_COMBINATIONS = MAIN_WEAPONS.reduce((acc, mw) => {
  acc[mw] = [...SUB_WEAPONS];
  return acc;
}, {} as Record<string, string[]>);

type ScreenState = 'setup' | 'advanced' | 'result';
type Language = 'ja' | 'en';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('setup');
  const [lang, setLang] = useState<Language>('ja');
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  
  const [config, setConfig] = useState<RandomizerConfig>({
    autoTeams: true,
    useRanks: true,
    restrictWeapons: true,
    restrictWeaponCombinations: false,
    restrictAgents: false,
    restrictRoles: false,
    allowDuplicateAgents: false,
  });

  const [advanced, setAdvanced] = useState<AdvancedConfig>({
    bannedMaps: [],
    bannedWeapons: [],
    bannedAgents: [],
    mapWeights: {},
    weaponWeights: {},
    agentWeights: {},
    weaponCombinations: INITIAL_COMBINATIONS,
    maxRankWeightDifference: 10
  });

  const [selectedComboMain, setSelectedComboMain] = useState<string>(MAIN_WEAPONS[0]);
  const [agentFilter, setAgentFilter] = useState<Role | 'All'>('All');

  const [result, setResult] = useState<MatchResult | null>(null);

  const t = TRANSLATIONS[lang] as Record<string, string>;

  const handleGenerate = () => {
    const activePlayers = players.filter(p => p.name.trim() !== '');
    if (activePlayers.length === 0) return;
    
    if (config.restrictAgents) {
      const validationResult = validateTeamCreation(
        AGENTS.length,
        advanced.bannedAgents.length,
        config.allowDuplicateAgents
      );

      if (!validationResult.isValid && validationResult.errorMessageKey) {
        alert(t[validationResult.errorMessageKey]);
        return;
      }
    }

    setResult(generateMatch(activePlayers, config, advanced));
    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleConfig = (key: keyof RandomizerConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const updatePlayerRank = (index: number, rank: Rank) => {
    const newPlayers = [...players];
    newPlayers[index].rank = rank;
    setPlayers(newPlayers);
  };

  const updatePlayerTier = (index: number, tier: Tier) => {
    const newPlayers = [...players];
    newPlayers[index].tier = tier;
    setPlayers(newPlayers);
  };

  const togglePlayerRole = (index: number, role: Role) => {
    const newPlayers = [...players];
    const roles = newPlayers[index].preferredRoles;
    if (roles.includes(role)) {
      newPlayers[index].preferredRoles = roles.filter(r => r !== role);
    } else {
      newPlayers[index].preferredRoles = [...roles, role];
    }
    setPlayers(newPlayers);
  };

  const updatePlayerTeam = (index: number, team: Team) => {
    const newPlayers = [...players];
    newPlayers[index].fixedTeam = team;
    setPlayers(newPlayers);
  };

  const toggleBan = (listKey: 'bannedMaps' | 'bannedWeapons' | 'bannedAgents', item: string) => {
    setAdvanced(prev => ({
      ...prev,
      [listKey]: prev[listKey].includes(item) 
        ? prev[listKey].filter(i => i !== item)
        : [...prev[listKey], item]
    }));
  };

  const updateWeight = (dictKey: 'mapWeights' | 'weaponWeights' | 'agentWeights', item: string, weight: number) => {
    setAdvanced(prev => ({
      ...prev,
      [dictKey]: { ...prev[dictKey], [item]: weight }
    }));
  };

  const renderToggle = (key: keyof RandomizerConfig, label: string) => (
    <label key={key} className="flex items-center gap-2 cursor-pointer group bg-black/30 px-3 py-1.5 transition-colors rounded hover:bg-black/50">
      <div className="relative pointer-events-none shrink-0">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={config[key]}
          onChange={() => toggleConfig(key)}
        />
        <div className={`w-8 h-4 rounded-full transition-colors ${config[key] ? 'bg-val-red' : 'bg-val-gray'}`}></div>
        <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${config[key] ? 'translate-x-4' : ''}`}></div>
      </div>
      <span className="uppercase text-xs md:text-sm tracking-wider group-hover:text-val-red transition-colors whitespace-nowrap">{label}</span>
    </label>
  );

  const renderPlayerRow = (player: Player, index: number) => (
    <div key={player.id} className="bg-black/40 p-2 border border-val-gray/20 focus-within:border-val-red transition-colors flex items-center gap-2 md:gap-3">
      <span className="text-val-gray font-bold w-4 md:w-5 text-sm md:text-base text-right shrink-0">
        {index + 1}.
      </span>

      {!config.autoTeams && (
        <button
          onClick={() => updatePlayerTeam(index, player.fixedTeam === 'Team 1' ? 'Team 2' : 'Team 1')}
          className={`p-1 text-[10px] md:text-xs font-bold w-7 md:w-8 rounded shrink-0 transition-colors ${player.fixedTeam === 'Team 1' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}
          title="Click to change team"
        >
          {player.fixedTeam === 'Team 1' ? 'T1' : 'T2'}
        </button>
      )}

      <input
        type="text"
        value={player.name}
        onChange={(e) => updatePlayerName(index, e.target.value)}
        className="bg-transparent border-b border-val-gray/50 focus:border-val-red outline-none px-2 py-0.5 flex-1 text-sm md:text-base min-w-[60px]"
        placeholder={t.playerName}
      />
      
      <div className="flex gap-1 shrink-0 items-center">
        {player.rank !== 'None' ? (
          <img 
            src={getRankImagePath(player.rank, player.tier)} 
            alt={player.rank} 
            className="w-6 h-6 md:w-8 md:h-8 object-contain"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        ) : (
          <div className="w-6 h-6 md:w-8 md:h-8" />
        )}
        <select
          value={player.rank}
          onChange={(e) => updatePlayerRank(index, e.target.value as Rank)}
          className="bg-val-dark border border-val-gray/50 text-val-light text-xs md:text-sm p-1 md:p-1.5 w-[85px] outline-none focus:border-val-red cursor-pointer"
        >
          {RANKS.map(rank => (
            <option key={rank} value={rank}>
              {rank === 'None' ? t.unranked : rank}
            </option>
          ))}
        </select>
        {player.rank !== 'None' && player.rank !== 'Radiant' && (
          <select
            value={player.tier}
            onChange={(e) => updatePlayerTier(index, Number(e.target.value) as Tier)}
            className="bg-val-dark border border-val-gray/50 text-val-light text-xs md:text-sm p-1 md:p-1.5 w-[40px] outline-none focus:border-val-red cursor-pointer"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        )}
      </div>

      <div className="flex gap-1 items-center bg-black/30 p-1 rounded border border-val-gray/30 shrink-0">
        {ROLES.map(role => {
          const isSelected = player.preferredRoles.includes(role);
          return (
            <button
              key={role}
              onClick={() => togglePlayerRole(index, role)}
              className={`p-1 rounded transition-colors ${isSelected ? 'bg-val-red/80 text-white shadow-[0_0_8px_rgba(255,70,85,0.6)]' : 'bg-transparent text-val-gray hover:bg-val-gray/20 hover:text-white'}`}
              title={role}
            >
              <RoleIcon role={role} className="w-3 h-3 md:w-4 md:h-4 drop-shadow-md" />
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderAdvancedSection = (title: string, items: string[], banKey: 'bannedMaps' | 'bannedWeapons' | 'bannedAgents', weightKey: 'mapWeights' | 'weaponWeights' | 'agentWeights', category: 'maps' | 'weapons' | 'agents') => {
    const displayedItems = category === 'agents' && agentFilter !== 'All' 
      ? items.filter(item => AGENT_ROLES[item] === agentFilter)
      : items;

    const activeWeight = items.reduce((sum, item) => advanced[banKey].includes(item) ? sum : sum + (advanced[weightKey][item] ?? 10), 0);

    return (
      <details className="bg-black/30 p-4 border-l-4 border-val-gray group mb-4 shadow-xl">
        <summary className="font-bold text-lg cursor-pointer flex justify-between items-center outline-none">
          <div className="flex items-center gap-3">
            {title}
          </div>
          <span className="text-val-gray group-open:rotate-180 transition-transform">▼</span>
        </summary>

        {category === 'agents' && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setAgentFilter('All')}
              className={`px-3 py-1.5 border rounded text-xs md:text-sm font-bold transition-colors ${agentFilter === 'All' ? 'border-val-red bg-val-red/20 text-white' : 'border-val-gray/30 bg-val-dark text-val-gray hover:border-val-gray/60 hover:text-val-light'}`}
            >
              ALL
            </button>
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => setAgentFilter(role)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs md:text-sm font-bold transition-colors ${agentFilter === role ? 'border-val-red bg-val-red/20 text-white' : 'border-val-gray/30 bg-val-dark text-val-gray hover:border-val-gray/60 hover:text-val-light'}`}
              >
                <RoleIcon role={role} className="w-3 h-3 md:w-4 md:h-4" /> {role}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 mt-4 overflow-visible pb-12">
          {displayedItems.map(item => (
            <AdvancedItemCard 
              key={item}
              item={item}
              category={category}
              isBanned={advanced[banKey].includes(item)}
              currentWeight={advanced[weightKey][item] ?? 10}
              totalActiveWeight={activeWeight}
              onToggleBan={() => toggleBan(banKey, item)}
              onUpdateWeight={(w) => updateWeight(weightKey, item, w)}
              t={t}
            />
          ))}
        </div>
      </details>
    );
  };

  const allPlayers = result ? [...result.team1, ...result.team2] : [];
  const defenders = allPlayers.filter(p => p.assignedSide === 'Defender');
  const attackers = allPlayers.filter(p => p.assignedSide === 'Attacker');

  const defenderTeamName = result?.team1Side === 'Defender' ? t.team1 : t.team2;
  const attackerTeamName = result?.team1Side === 'Attacker' ? t.team1 : t.team2;

  const defenderWeight = defenders.reduce((sum, p) => sum + getRankWeight(p.rank, p.tier), 0);
  const attackerWeight = attackers.reduce((sum, p) => sum + getRankWeight(p.rank, p.tier), 0);

  return (
    <div className="min-h-screen bg-val-dark text-val-light font-sans selection:bg-val-red selection:text-white flex flex-col">
      <header className="border-b border-val-gray/30 p-2 md:p-3 flex justify-between items-center bg-val-dark sticky top-0 z-30 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          {screen !== 'setup' && (
            <button 
              onClick={() => setScreen('setup')}
              className="text-val-gray hover:text-white transition-colors p-1"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}
          <h1 className="text-lg md:text-2xl font-bold tracking-tighter uppercase italic flex items-center gap-1.5 md:gap-2">
            <Swords className="text-val-red w-4 h-4 md:w-6 md:h-6" />
            {t.title.split(' ')[0]} <span className="text-val-red">{t.title.split(' ')[1]}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded border border-val-gray/20">
            <Globe className="w-4 h-4 text-val-gray" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent text-val-light text-xs md:text-sm outline-none cursor-pointer uppercase font-bold"
            >
              <option value="ja">JP</option>
              <option value="en">EN</option>
            </select>
          </div>

          {screen === 'setup' && (
            <button 
              onClick={handleGenerate}
              className="bg-val-red hover:bg-red-600 text-white px-4 py-1.5 md:px-6 md:py-2 font-bold uppercase tracking-wider transition-colors animate-pulse text-xs md:text-sm shrink-0"
            >
              {t.generate}
            </button>
          )}
          {screen === 'result' && (
            <button 
              onClick={handleGenerate}
              className="bg-val-gray/20 hover:bg-val-gray/40 text-white px-3 py-1.5 md:px-4 md:py-2 font-bold uppercase tracking-wider transition-colors border border-val-gray/50 flex items-center gap-2 text-xs md:text-sm shrink-0"
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4" /> {t.reroll}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[100rem] w-full mx-auto p-2 md:p-4 flex flex-col min-h-0">
        
        {screen === 'setup' && (
          <div className="space-y-4 md:space-y-6 animate-slide-up overflow-y-auto pb-10">
            <section className="bg-val-blue border-l-4 border-val-red p-4 md:p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-bold uppercase italic flex items-center gap-2">
                  <Settings2 className="text-val-red w-5 h-5" /> {t.rules}
                </h2>
                <button 
                  onClick={() => setScreen('advanced')}
                  className="bg-val-gray/20 hover:bg-val-gray/40 text-val-light px-3 py-1.5 rounded text-xs md:text-sm flex items-center gap-2 transition-colors border border-val-gray/30"
                >
                  <SlidersHorizontal className="w-4 h-4 text-val-red" /> {t.advancedSettings}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-val-dark/50 p-3 rounded border border-val-gray/20 flex flex-col gap-2">
                  <h3 className="text-sm md:text-base font-bold text-val-gray border-b border-val-gray/30 pb-1.5 mb-1">{t.categoryTeam}</h3>
                  {renderToggle('autoTeams', t.autoTeams)}
                  {config.autoTeams && (
                    <div className="pl-4 ml-2 border-l-2 border-val-gray/30 flex flex-col gap-2">
                      {renderToggle('useRanks', t.useRanks)}
                    </div>
                  )}
                </div>

                <div className="bg-val-dark/50 p-3 rounded border border-val-gray/20 flex flex-col gap-2">
                  <h3 className="text-sm md:text-base font-bold text-val-gray border-b border-val-gray/30 pb-1.5 mb-1">{t.categoryAgent}</h3>
                  {renderToggle('restrictAgents', t.restrictAgents)}
                  {config.restrictAgents && (
                    <div className="pl-4 ml-2 border-l-2 border-val-gray/30 flex flex-col gap-2">
                      {renderToggle('allowDuplicateAgents', t.allowDuplicateAgents)}
                    </div>
                  )}
                  {renderToggle('restrictRoles', t.restrictRoles)}
                </div>

                <div className="bg-val-dark/50 p-3 rounded border border-val-gray/20 flex flex-col gap-2">
                  <h3 className="text-sm md:text-base font-bold text-val-gray border-b border-val-gray/30 pb-1.5 mb-1">{t.categoryWeapon}</h3>
                  {renderToggle('restrictWeapons', t.restrictWeapons)}
                  {config.restrictWeapons && (
                    <div className="pl-4 ml-2 border-l-2 border-val-gray/30 flex flex-col gap-2">
                      {renderToggle('restrictWeaponCombinations', t.restrictWeaponCombinations)}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-val-blue border-l-4 border-val-gray p-4 md:p-5">
              <h2 className="text-lg md:text-xl font-bold mb-3 uppercase italic flex items-center gap-2">
                <Users className="text-val-gray w-5 h-5" /> {t.players}
              </h2>

              {!config.autoTeams ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-blue-400 border-b border-blue-500/30 pb-1 flex justify-between items-end">
                      {t.team1}
                      <span className="text-xs font-normal text-val-light opacity-60">{players.filter(p => p.fixedTeam === 'Team 1').length} {t.playerCount}</span>
                    </h3>
                    <div className="flex flex-col gap-2">
                      {players.map((p, i) => p.fixedTeam === 'Team 1' && renderPlayerRow(p, i))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-val-red border-b border-val-red/30 pb-1 flex justify-between items-end">
                      {t.team2}
                      <span className="text-xs font-normal text-val-light opacity-60">{players.filter(p => p.fixedTeam === 'Team 2').length} {t.playerCount}</span>
                    </h3>
                    <div className="flex flex-col gap-2">
                      {players.map((p, i) => p.fixedTeam === 'Team 2' && renderPlayerRow(p, i))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2">
                  {players.map((p, i) => renderPlayerRow(p, i))}
                </div>
              )}
            </section>

            <section className="bg-val-dark p-4 border border-val-gray/20 rounded shadow-md overflow-visible">
              <h2 className="text-sm md:text-base font-bold mb-3 uppercase italic text-val-gray flex items-center gap-2">
                <Ban className="w-4 h-4" /> Quick Bans & Weights
              </h2>
              <div className="space-y-4">
                <QuickBanCarousel title={t.mapSettings} items={MAPS} category="maps" bannedList={advanced.bannedMaps} weights={advanced.mapWeights} onToggle={(item) => toggleBan('bannedMaps', item)} onUpdateWeight={(item, weight) => updateWeight('mapWeights', item, weight)} />
                <QuickBanCarousel title={t.agentSettings} items={AGENTS} category="agents" bannedList={advanced.bannedAgents} weights={advanced.agentWeights} onToggle={(item) => toggleBan('bannedAgents', item)} onUpdateWeight={(item, weight) => updateWeight('agentWeights', item, weight)} />
                <QuickBanCarousel title={t.weaponSettings} items={[...MAIN_WEAPONS, ...SUB_WEAPONS]} category="weapons" bannedList={advanced.bannedWeapons} weights={advanced.weaponWeights} onToggle={(item) => toggleBan('bannedWeapons', item)} onUpdateWeight={(item, weight) => updateWeight('weaponWeights', item, weight)} />
              </div>
            </section>
          </div>
        )}

        {screen === 'advanced' && (
          <div className="animate-slide-up overflow-y-auto pb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-6 uppercase italic flex items-center gap-2 text-val-red">
              <SlidersHorizontal className="w-6 h-6" /> {t.advancedSettings}
            </h2>

            <div className="bg-black/30 p-4 border-l-4 border-val-gray group mb-4 shadow-xl flex items-center justify-between">
              <span className="font-bold text-sm md:text-lg">{t.maxRankDifference}</span>
              <div className="flex items-center bg-black/40 px-2 py-1 rounded border border-val-gray/30 focus-within:border-val-red">
                <input
                  type="number"
                  min="0"
                  value={advanced.maxRankWeightDifference}
                  onChange={(e) => setAdvanced(prev => ({ ...prev, maxRankWeightDifference: Number(e.target.value) }))}
                  className="bg-transparent text-val-light text-sm w-12 text-center outline-none appearance-none [-moz-appearance:textfield]"
                />
              </div>
            </div>

            {renderAdvancedSection(t.mapSettings, MAPS, 'bannedMaps', 'mapWeights', 'maps')}
            {renderAdvancedSection(t.agentSettings, AGENTS, 'bannedAgents', 'agentWeights', 'agents')}
            {renderAdvancedSection(t.weaponSettings, [...MAIN_WEAPONS, ...SUB_WEAPONS], 'bannedWeapons', 'weaponWeights', 'weapons')}
            
            <details className="bg-black/30 p-4 border-l-4 border-val-gray group mb-4 shadow-xl">
              <summary className="font-bold text-lg cursor-pointer flex justify-between items-center outline-none">
                {t.weaponCombinations}
                <span className="text-val-gray group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-4 flex flex-col gap-6">
                <div>
                  <div className="text-sm font-bold text-val-gray mb-3">{t.selectMainWeapon}</div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-3">
                    {MAIN_WEAPONS.map(mw => {
                      const isSelected = selectedComboMain === mw;
                      const isBanned = advanced.bannedWeapons.includes(mw);
                      return (
                        <button
                          key={mw}
                          onClick={() => {
                            if (isBanned) {
                              if (window.confirm(t.unbanConfirm.replace('{weapon}', mw))) {
                                setAdvanced(prev => ({
                                  ...prev,
                                  bannedWeapons: prev.bannedWeapons.filter(w => w !== mw)
                                }));
                                setSelectedComboMain(mw);
                              }
                            } else {
                              setSelectedComboMain(mw);
                            }
                          }}
                          className={`relative w-full aspect-video rounded overflow-hidden border-2 transition-all ${isSelected && !isBanned ? 'border-val-red bg-val-red/10 shadow-[0_0_8px_rgba(255,70,85,0.4)]' : 'border-val-gray/30 bg-val-dark hover:border-val-gray/60'} ${isBanned ? 'opacity-80' : ''}`}
                          title={`Select ${mw}`}
                        >
                          <img 
                            src={getImagePath('weapons', mw)} 
                            alt={mw} 
                            className={`w-full h-full object-contain p-1 transition-all duration-300 ${isSelected && !isBanned ? 'opacity-100 scale-110' : 'opacity-60 group-hover:opacity-100'} ${isBanned ? 'grayscale opacity-40' : ''}`} 
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                          {isBanned && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 z-10">
                              <Ban className="w-4 h-4 md:w-5 md:h-5 text-val-red drop-shadow-md mb-0.5" />
                              <span className="text-[7px] md:text-[8px] text-white font-bold leading-tight px-1 whitespace-nowrap">{t.bannedStatus}</span>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/70 to-transparent p-0.5 pt-3 pointer-events-none text-center z-20">
                            <div className={`font-bold text-[8px] md:text-[10px] truncate drop-shadow-md ${isSelected && !isBanned ? 'text-white' : 'text-val-gray'} ${isBanned ? 'line-through' : ''}`}>
                              {mw}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-val-gray mb-3">{t.allowedSubWeapons}</div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {SUB_WEAPONS.map(sw => {
                      const isAllowed = advanced.weaponCombinations[selectedComboMain]?.includes(sw) ?? true;
                      const isBanned = advanced.bannedWeapons.includes(sw);
                      return (
                        <button
                          key={sw}
                          onClick={() => {
                            if (isBanned) {
                              if (window.confirm(t.unbanConfirm.replace('{weapon}', sw))) {
                                setAdvanced(prev => {
                                  const newBannedWeapons = prev.bannedWeapons.filter(w => w !== sw);
                                  const current = prev.weaponCombinations[selectedComboMain] || [];
                                  const updated = current.includes(sw) ? current : [...current, sw];
                                  return { ...prev, bannedWeapons: newBannedWeapons, weaponCombinations: { ...prev.weaponCombinations, [selectedComboMain]: updated } };
                                });
                              }
                            } else {
                              setAdvanced(prev => {
                                const current = prev.weaponCombinations[selectedComboMain] || [];
                                const updated = current.includes(sw) ? current.filter(w => w !== sw) : [...current, sw];
                                return { ...prev, weaponCombinations: { ...prev.weaponCombinations, [selectedComboMain]: updated } };
                              });
                            }
                          }}
                          className={`relative w-full aspect-video rounded overflow-hidden border-2 transition-all ${isAllowed && !isBanned ? 'border-val-red bg-val-dark shadow-[0_0_8px_rgba(255,70,85,0.4)]' : 'border-val-gray/20 bg-black/80'}`}
                        >
                          <img src={getImagePath('weapons', sw)} alt={sw} className={`w-full h-full object-contain p-1 transition-transform ${isAllowed && !isBanned ? 'opacity-100 group-hover:scale-110' : 'grayscale opacity-40'}`} onError={(e) => e.currentTarget.style.display = 'none'} />
                          
                          {isBanned ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 z-10">
                              <Ban className="w-4 h-4 md:w-5 md:h-5 text-val-red drop-shadow-md mb-0.5" />
                              <span className="text-[7px] md:text-[8px] text-white font-bold leading-tight px-1 whitespace-nowrap">{t.bannedStatus}</span>
                            </div>
                          ) : !isAllowed && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-900/30 z-10">
                              <Ban className="w-5 h-5 md:w-6 md:h-6 text-val-red drop-shadow-md" />
                            </div>
                          )}

                          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/70 to-transparent p-0.5 pt-3 pointer-events-none text-center z-20">
                            <div className={`font-bold text-[8px] md:text-[9px] truncate drop-shadow-md ${isAllowed && !isBanned ? 'text-white' : 'text-val-gray line-through'}`}>
                                {sw}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {screen === 'result' && result && (
          <div className="flex flex-col gap-2 md:gap-3 animate-slide-up flex-1 relative min-h-0">
            {result.map && (
              <div className="relative w-full h-20 md:h-32 shrink-0 rounded overflow-hidden border border-val-gray/30 shadow-lg bg-val-dark">
                <img 
                  src={getImagePath('maps', result.map)} 
                  alt={result.map} 
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-val-dark via-val-dark/70 to-transparent pointer-events-none"></div>
                <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-3 md:p-6 pointer-events-none">
                  <span className="text-[9px] md:text-xs text-val-gray font-bold uppercase tracking-widest mb-0.5 md:mb-1">{t.map}</span>
                  <span className="text-xl md:text-4xl text-white font-bold uppercase tracking-tighter italic drop-shadow-md">{result.map}</span>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col relative min-h-0 gap-2 md:gap-3">
              <div className="flex-1 bg-blue-900/10 border-t-2 border-blue-500 p-2 relative overflow-hidden shadow-lg flex flex-col min-h-0 rounded-b">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none"><Shield className="w-64 h-64" /></div>
                <div className="flex items-center gap-3 mb-1.5 relative z-10 pl-1 shrink-0">
                  <h2 className="text-lg md:text-xl font-bold uppercase italic tracking-tighter text-blue-400 flex items-center gap-2">
                    {t.defenders}
                    {!config.autoTeams && <span className="text-sm font-normal text-val-light opacity-80 tracking-widest">[{defenderTeamName}]</span>}
                  </h2>
                  {config.useRanks && config.autoTeams && (
                    <span className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded text-xs md:text-sm border border-blue-500/30">
                      {t.teamWeight.replace('{weight}', String(defenderWeight))}
                    </span>
                  )}
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-5 gap-1.5 md:gap-2 relative z-10 flex-1 min-h-0">
                  {defenders.map(p => <PlayerCard key={p.id} player={p} isDefender={true} />)}
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center gap-1">
                <div className="bg-val-dark px-4 py-1 border-2 border-val-red text-val-red font-bold text-base md:text-lg italic shadow-2xl skew-x-[-10deg]"><div className="skew-x-[10deg]">VS</div></div>
              </div>

              <div className="flex-1 bg-red-900/10 border-t-2 border-val-red p-2 relative overflow-hidden shadow-lg flex flex-col min-h-0 rounded-b">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none"><Swords className="w-64 h-64" /></div>
                <div className="flex items-center gap-3 mb-1.5 relative z-10 pl-1 shrink-0">
                  <h2 className="text-lg md:text-xl font-bold uppercase italic tracking-tighter text-val-red flex items-center gap-2">
                    {t.attackers}
                    {!config.autoTeams && <span className="text-sm font-normal text-val-light opacity-80 tracking-widest">[{attackerTeamName}]</span>}
                  </h2>
                  {config.useRanks && config.autoTeams && (
                    <span className="bg-red-900/40 text-val-red px-2 py-0.5 rounded text-xs md:text-sm border border-val-red/30">
                      {t.teamWeight.replace('{weight}', String(attackerWeight))}
                    </span>
                  )}
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-val-red/50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-5 gap-1.5 md:gap-2 relative z-10 flex-1 min-h-0">
                  {attackers.map(p => <PlayerCard key={p.id} player={p} isDefender={false} />)}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;