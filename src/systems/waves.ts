import type { Difficulty, Faction } from '../data/types';
import { difficultyRules } from '../data/difficulty';
import { doctrineFor } from '../data/doctrines';

export interface SpawnOrder { enemyId:string; delay:number; groupId:number; lane:number }
export function buildWave(wave:number, difficulty:Difficulty, enemyFaction:Faction):SpawnOrder[]{
  const rules=difficultyRules[difficulty];
  const doc=doctrineFor(enemyFaction);
  const effective=Math.max(1,wave+rules.advancedWaveOffset);
  const light=['rifle','rifle','recon','specialist'];
  const mobile=effective>=3?['light-vehicle','apc']:[];
  const heavy=effective>=5?['ifv','fpv','uav']:[];
  const late=effective>=7?['tank','helo']:[];
  let count=Math.max(8,Math.round((10+wave*3)*rules.enemyCount));
  if(difficulty==='Realistic') count=Math.round(count*(0.82+enemyFaction.realistic.offense/170));
  const result:SpawnOrder[]=[];
  const groupSize=Math.max(3,Math.round(4+doc.combinedArms*4));
  let remaining=count, groupId=0;
  while(remaining>0){
    groupId++;
    const size=Math.min(remaining,Math.max(3,groupSize+Math.floor(Math.random()*3)-1));
    const lane=groupId%Math.max(2,doc.axes);
    const pool=[...light,...mobile,...heavy,...late];
    for(let i=0;i<size;i++){
      let enemyId='rifle';
      const r=Math.random();
      if(effective>=7 && r<.08*doc.armorUse) enemyId='tank';
      else if(effective>=5 && r<.18*doc.droneUse) enemyId=Math.random()<.55?'fpv':'uav';
      else if(effective>=4 && r<.34*doc.combinedArms) enemyId=Math.random()<.5?'apc':'ifv';
      else if(effective>=2 && i===0 && Math.random()<doc.reconLead) enemyId='recon';
      else enemyId=pool[Math.floor(Math.random()*pool.length)]||'rifle';
      result.push({enemyId,groupId,lane,delay:i===size-1?Math.max(.7,1.55-doc.aggression*.65):Math.max(.12,.34-doc.aggression*.12)});
    }
    remaining-=size;
  }
  return result;
}
