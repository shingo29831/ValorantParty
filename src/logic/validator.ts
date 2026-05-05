// src/logic/validator.ts
// AI: チーム作成前の事前検証ロジック
import { Agent } from '../types';

export const validateTeamCreation = (
  agents: Agent[],
  allowDuplicateAgents: boolean
): { isValid: boolean; errorMessageKey: string | null } => {
  if (!allowDuplicateAgents) {
    const unbannedAgents = agents.filter(agent => !agent.isBanned);
    
    // 重複なしで1チーム5人を構成するには最低5体のエージェントが必要
    if (unbannedAgents.length <= 4) {
      return {
        isValid: false,
        errorMessageKey: 'notEnoughAgentsWarning'
      };
    }
  }

  return {
    isValid: true,
    errorMessageKey: null
  };
};