import type { Difficulty, Faction } from '../data/types';
export function realisticMatchup(player:Faction, enemy:Faction){
  const p=(player.realistic.defense*.38+player.realistic.air*.13+player.realistic.armor*.12+player.realistic.drones*.14+player.realistic.infantry*.13+player.realistic.offense*.10);
  const e=(enemy.realistic.offense*.34+enemy.realistic.air*.15+enemy.realistic.armor*.15+enemy.realistic.drones*.16+enemy.realistic.infantry*.12+enemy.realistic.defense*.08);
  const delta=e-p;
  if(delta<-12) return 'Easy'; if(delta<0) return 'Moderate'; if(delta<10) return 'Difficult'; if(delta<20) return 'Severe'; return 'Extreme';
}
export function factionTowerScale(f:Faction,d:Difficulty){ return d==='Realistic' ? .72+f.realistic.defense/350 : 1; }
export function factionEnemyScale(f:Faction,d:Difficulty){ return d==='Realistic' ? .70+f.realistic.offense/330 : 1; }
