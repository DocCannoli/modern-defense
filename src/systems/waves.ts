import type { Difficulty, Faction } from '../data/types';
import { difficultyRules } from '../data/difficulty';
import { doctrineFor } from '../data/doctrines';
export interface SpawnOrder { enemyId:string; delay:number; groupId:number; lane:number; formationSlot:number }
export interface ThreatPreview { infantry:boolean; armor:boolean; drones:boolean; air:boolean; axes:number; text:string }
export function previewWave(wave:number,difficulty:Difficulty,faction:Faction):ThreatPreview{
 const r=difficultyRules[difficulty],eff=Math.max(1,wave+r.advancedWaveOffset),d=doctrineFor(faction);
 const infantry=true,armor=eff>=3,drones=eff>=4,air=eff>=6; const axes=Math.min(5,Math.max(1,Math.round(1+(wave/3)+(d.axes-2)*.45)));
 const bits=['infantry']; if(armor)bits.push('armor'); if(drones)bits.push('drones'); if(air)bits.push('air');
 return {infantry,armor,drones,air,axes,text:`Expected ${bits.join(', ')} · ${axes} attack ${axes===1?'axis':'axes'}`};
}
export function buildWave(wave:number,difficulty:Difficulty,enemyFaction:Faction):SpawnOrder[]{
 const rules=difficultyRules[difficulty],doc=doctrineFor(enemyFaction),eff=Math.max(1,wave+rules.advancedWaveOffset);
 let count=Math.max(10,Math.round((12+wave*3.2)*rules.enemyCount)); if(difficulty==='Realistic')count=Math.round(count*(.82+enemyFaction.realistic.offense/175));
 const axes=Math.min(5,Math.max(2,Math.round(2+(wave-1)/3+(doc.axes-3)*.35))); const groupSize=Math.max(4,Math.round(4+doc.combinedArms*5)); const out:SpawnOrder[]=[];
 let remaining=count,groupId=0;
 while(remaining>0){groupId++; const size=Math.min(remaining,Math.max(4,groupSize+Math.floor(Math.random()*3)-1)); const lane=groupId%axes;
  for(let i=0;i<size;i++){let id='rifle'; const r=Math.random();
   if(i===0&&Math.random()<doc.recon)id=eff>=4&&Math.random()<doc.droneUse*.55?'recon-drone':'recon';
   else if(eff>=7&&r<.09*doc.armorUse)id='tank';
   else if(eff>=5&&r<.17*doc.droneUse)id=Math.random()<.58?'fpv':'uav';
   else if(eff>=6&&r<.06*doc.combinedArms)id='helo';
   else if(eff>=4&&r<.36*doc.combinedArms)id=Math.random()<.48?'apc':'ifv';
   else if(eff>=2&&r<.18)id='specialist';
   else if(eff>=2&&r<.28)id='light-vehicle';
   out.push({enemyId:id,groupId,lane,formationSlot:i,delay:i===size-1?Math.max(.75,1.7-doc.aggression*.7):Math.max(.13,.38-doc.aggression*.13)});
  }
  remaining-=size;
 }
 return out;
}
