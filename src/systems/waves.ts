import type { Difficulty, Faction } from '../data/types';
import { difficultyRules } from '../data/difficulty';

export interface SpawnOrder { enemyId:string; delay:number }
export function buildWave(wave:number, difficulty:Difficulty, enemyFaction:Faction):SpawnOrder[]{
  const rules=difficultyRules[difficulty];
  const effective=Math.max(1,wave+rules.advancedWaveOffset);
  const pool=['rifle'];
  if(effective>=2) pool.push('recon','specialist');
  if(effective>=3) pool.push('light-vehicle');
  if(effective>=4) pool.push('apc','recon-drone');
  if(effective>=5) pool.push('ifv','fpv');
  if(effective>=6) pool.push('uav');
  if(effective>=7) pool.push('tank');
  if(effective>=8) pool.push('helo');
  const base=6+wave*2;
  let count=Math.max(4,Math.round(base*rules.enemyCount));
  if(difficulty==='Realistic') count=Math.round(count*(0.78+enemyFaction.realistic.offense/180));
  const result:SpawnOrder[]=[];
  for(let i=0;i<count;i++){
    let idx=Math.floor(Math.random()*pool.length);
    // Heavier assets stay less common.
    if(Math.random()<0.5) idx=Math.floor(Math.random()*Math.max(1,pool.length-2));
    result.push({enemyId:pool[idx],delay:Math.max(.35,1.05-wave*.035)});
  }
  if(wave%3===0 && effective>=4) result.push({enemyId:'apc',delay:.6});
  if(wave%5===0 && effective>=7) result.push({enemyId:'tank',delay:.7});
  return result;
}
