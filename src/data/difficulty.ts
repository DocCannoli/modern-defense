import type { Difficulty, DifficultyRules } from './types';

export const difficultyRules:Record<Difficulty,DifficultyRules> = {
  Easy:{enemyHp:.80,enemyDamage:.80,enemyCount:.80,advancedWaveOffset:2,balancedFactions:true},
  Normal:{enemyHp:1,enemyDamage:1,enemyCount:1,advancedWaveOffset:0,balancedFactions:true},
  Hard:{enemyHp:1.15,enemyDamage:1.10,enemyCount:1.15,advancedWaveOffset:-1,balancedFactions:true},
  Veteran:{enemyHp:1.30,enemyDamage:1.25,enemyCount:1.30,advancedWaveOffset:-2,balancedFactions:true},
  Realistic:{enemyHp:1,enemyDamage:1,enemyCount:1,advancedWaveOffset:0,balancedFactions:false},
};

export const difficultyDescriptions:Record<Difficulty,string> = {
  Easy:'More forgiving attacks with fewer enemies and slower escalation.',
  Normal:'Balanced baseline. Countries remain broadly comparable.',
  Hard:'Denser attacks, tougher enemies, and earlier advanced threats.',
  Veteran:'Aggressive combined-arms pressure with little margin for error.',
  Realistic:'Disables faction equalization and uses each side’s actual strengths, weaknesses, and force emphasis.',
};
