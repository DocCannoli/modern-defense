import type { CampaignDefinition,Faction,MissionDefinition,MissionType } from './types';
const types:MissionType[]=['BaseDefense','FieldDefense','Assault','BaseDefense','Seize','FieldDefense','Assault','Escort','BaseDefense','Assault'];
const titles=['First Contact','Hold the Line','Counterstroke','Pressure Builds','Seize the Crossing','No Ground Given','Break the Strongpoint','Protect the Column','Main Attack','Decisive Operation'];
const themes:MissionDefinition['mapTheme'][]=['Temperate','Mountain','Urban','Temperate','Coastal','Desert','Urban','Jungle','Snow','Mountain'];
function mission(n:number,p:Faction,e:Faction):MissionDefinition{
 const type=types[n-1],off=type==='Assault'||type==='Seize';const field=type==='FieldDefense';
 return {id:`${p.id}-vs-${e.id}-${n}`,number:n,title:titles[n-1],operation:`Operation ${['Sentinel','Granite','Crosswind','Iron Lantern','Bridgehead','Bulwark','Hammerfall','Long Road','Stormwall','Final Reach'][n-1]}`,type,
 story:`A fictional ${p.name}–${e.name} conflict intensifies as both sides commit increasingly capable forces.`,
 briefing:off?`${p.name} forces must take the initiative and break an organized ${e.name} defensive position.`:field?`${p.name} forces are holding exposed ground without permanent base infrastructure.`:`${p.name} forces must establish and hold a defensive position against a coordinated ${e.name} attack.`,
 primary:off?'Seize the enemy objective':field?'Hold the marked ground until relief arrives':'Prevent the enemy from destroying the command position',
 secondary:n>2?['Keep at least one squad combat-effective','Destroy a priority enemy element']:['Limit friendly casualties'],waves:3+Math.ceil(n*.65),startingCredits:950+n*95,deploymentCapacity:5+Math.floor(n/2),mapTheme:themes[n-1],weather:n%4===0?'Rain':n%5===0?'Fog':'Clear',timeOfDay:n===6||n===9?'Night':'Day',enemyEscalation:n,playerRole:off?'Attacker':'Defender',enemyRole:off?'Defender':'Attacker'};
}
export function campaignFor(player:Faction,enemy:Faction):CampaignDefinition{return {playerId:player.id,enemyId:enemy.id,title:`${player.name} vs ${enemy.name}`,synopsis:`A ten-mission fictional campaign following ${player.name} forces through escalating operations against ${enemy.name}.`,missions:Array.from({length:10},(_,i)=>mission(i+1,player,enemy))};}
