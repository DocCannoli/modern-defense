import type { Difficulty, EnemyDefinition, EnemyStatus, Faction, TowerDefinition, TowerKind, TowerStatus, UpgradeCategory } from '../data/types';

export interface Vec2 { x:number; y:number }
export interface TowerInstance {
  id:number; def:TowerDefinition; pos:Vec2; hp:number; maxHp:number; status:TowerStatus;
  upgrades:UpgradeCategory[]; targetId:number|null; cooldown:number; ammo:number; reloadTimer:number;
  personnel:number; maxPersonnel:number; casualtyTimers:number[]; repairTimer:number; repairCost:number;
}
export interface EnemyInstance {
  id:number; def:EnemyDefinition; faction:Faction; pos:Vec2; hp:number; maxHp:number; status:EnemyStatus;
  pathIndex:number; attackCooldown:number; targetTowerId:number|null; troopCount:number; crewCount:number; spawnedFromVehicle:boolean;
}
export interface Projectile { id:number; from:Vec2; to:Vec2; progress:number; speed:number; damage:number; targetId:number|null; splash:number; kind:TowerKind }
export interface GameSettings { playerFaction:Faction; enemyFaction:Faction; difficulty:Difficulty; branch:string; mission:number }
export interface CampaignSave { factionId:string; mission:number; factionPoints:number; upgrades:Record<string,number>; }
