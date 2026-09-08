import { units } from '../data/units';
import type { Difficulty,UnitDefinition } from '../data/types';
import { difficultyRules } from '../data/difficulty';
import type { DoctrineProfile } from '../data/doctrines';
export interface SpawnOrder{unitId:string;groupId:number;lane:number;formationSlot:number;delay:number}
export function buildEnemyWave(phase:number,missionNumber:number,difficulty:Difficulty,doc:DoctrineProfile):SpawnOrder[]{
 const r=difficultyRules[difficulty],effective=phase+Math.floor(missionNumber*.55)+r.advancedWaveOffset,count=Math.max(5,Math.round((5+phase*2.2+missionNumber*.65)*r.enemyCount));
 const pool=['rifle'];if(effective>=2)pool.push('mg');if(effective>=3)pool.push('at','mortar');if(effective>=4)pool.push('apc','recon-vehicle');if(effective>=5)pool.push('ifv','recon-drone');if(effective>=6)pool.push('cuas','armed-drone');if(effective>=7)pool.push('tank');if(effective>=8)pool.push('helicopter');
 const orders:SpawnOrder[]=[];const groupSize=Math.max(3,Math.round(3+doc.combinedArms*3));let group=1;
 for(let i=0;i<count;i++){if(i&&i%groupSize===0)group++;let id=pool[Math.floor(Math.random()*pool.length)];if(i%groupSize===0&&doc.recon>.8&&effective>2)id=Math.random()<.5?'recon-vehicle':'recon-drone';if(doc.armorUse>.9&&effective>5&&Math.random()<.16)id=Math.random()<.5?'ifv':'tank';if(doc.droneUse>.9&&effective>5&&Math.random()<.12)id='armed-drone';orders.push({unitId:id,groupId:group,lane:(group+i)%Math.max(2,doc.axes),formationSlot:i%groupSize,delay:.18+Math.random()*.3});}
 return orders;
}
export function previewEnemyWave(phase:number,missionNumber:number){const e=phase+Math.floor(missionNumber*.55);const tags=['infantry'];if(e>=3)tags.push('crew-served weapons');if(e>=4)tags.push('vehicles');if(e>=5)tags.push('drones');if(e>=7)tags.push('heavy armor');if(e>=8)tags.push('aviation');return tags.join(' · ')}
export function unitExists(id:string):UnitDefinition{return units[id]||units.rifle}
