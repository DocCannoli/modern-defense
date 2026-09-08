import type { Difficulty,DifficultyRules } from './types';
export const difficultyRules:Record<Difficulty,DifficultyRules>={
 Easy:{enemyHp:.82,enemyDamage:.78,enemyCount:.82,advancedWaveOffset:-1,balancedFactions:true,ai:.72},
 Normal:{enemyHp:1,enemyDamage:1,enemyCount:1,advancedWaveOffset:0,balancedFactions:true,ai:1},
 Hard:{enemyHp:1.06,enemyDamage:1.08,enemyCount:1.12,advancedWaveOffset:1,balancedFactions:true,ai:1.16},
 Veteran:{enemyHp:1.12,enemyDamage:1.16,enemyCount:1.22,advancedWaveOffset:2,balancedFactions:true,ai:1.32},
 Realistic:{enemyHp:1,enemyDamage:1,enemyCount:1.15,advancedWaveOffset:2,balancedFactions:false,ai:1.4},
};
export const difficultyDescriptions:Record<Difficulty,string>={Easy:'Forgiving AI and smaller attacks.',Normal:'Intended baseline experience.',Hard:'Better coordination and stronger force composition.',Veteran:'Aggressive adaptation and combined-arms pressure.',Realistic:'Faction equipment, organization and capability gaps matter more.'};
