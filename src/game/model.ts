import type { DetectionState, Difficulty, EnemyDefinition, EnemyStatus, Faction, TargetPriority, TowerDefinition, TowerKind, TowerStatus, UpgradeCategory } from '../data/types';
export interface Vec2 { x:number; y:number }
export interface FacilityInstance {
  id:number; def:TowerDefinition; homePos:Vec2; hp:number; maxHp:number; status:TowerStatus; upgrades:UpgradeCategory[];
  repairProgress:number; rebuildProgress:number; holdFire:boolean; targetPriority:TargetPriority;
}
export interface DefenseTeam {
  id:number; facilityId:number; kind:TowerKind; pos:Vec2; homePos:Vec2; hp:number; maxHp:number; status:TowerStatus;
  targetId:number|null; cooldown:number; ammo:number; reloadTimer:number; personnel:number; maxPersonnel:number; casualtyTimers:number[];
  deployTimer:number; suppression:number; repairProgress:number; rebuildProgress:number; holdFire:boolean; targetPriority:TargetPriority;
}
export interface BarrierInstance { id:number; a:Vec2; b:Vec2; hp:number; maxHp:number; gate:boolean; level:number; destroyed:boolean }
export interface EnemyInstance {
  id:number; def:EnemyDefinition; faction:Faction; pos:Vec2; hp:number; maxHp:number; status:EnemyStatus; attackCooldown:number;
  troopCount:number; crewCount:number; spawnedFromVehicle:boolean; groupId:number; lane:number; cover:number; suppression:number;
  detection:DetectionState; tacticalState:'Recon'|'Approach'|'Contact'|'Suppress'|'Maneuver'|'Breach'|'Assault'|'Consolidate';
  objective:Vec2; waypoint:Vec2|null; dismounted:boolean; oneWaySpent:boolean; orbitAngle:number; formationSlot:number;
}
export interface Projectile { id:number; from:Vec2; to:Vec2; progress:number; speed:number; damage:number; targetId:number|null; splash:number; kind:TowerKind }
export interface GameSettings { playerFaction:Faction; enemyFaction:Faction; difficulty:Difficulty; branch:string; mission:number; tutorial?:boolean }
export interface CampaignSave { factionId:string; mission:number; factionPoints:number; upgrades:Record<string,number>; tutorialComplete?:boolean; updatedAt?:number }
