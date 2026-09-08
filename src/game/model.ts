import type { BuildingKind,DetectionState,GameSettings,UnitDefinition,UnitOrder,UnitRole,UpgradeDefinition } from '../data/types';
export interface Vec2{x:number;y:number}
export interface BuildingInstance{id:number;kind:BuildingKind;pos:Vec2;hp:number;maxHp:number;upgrades:Record<string,number>;status:'Operational'|'Damaged'|'Destroyed'}
export interface SoldierInstance{id:number;offset:Vec2;hp:number;maxHp:number;state:'Ready'|'Moving'|'Firing'|'Reloading'|'Wounded'|'Treating'|'Crew';medic:boolean;engineer:boolean;casualtyTimer:number;phase:number}
export interface UnitInstance{
 id:number;side:'Friendly'|'Enemy';def:UnitDefinition;role:UnitRole;pos:Vec2;destination:Vec2;hp:number;maxHp:number;order:UnitOrder;status:string;
 soldiers:SoldierInstance[];weapons:number;ammo:number;reloadTimer:number;cooldown:number;targetId:number|null;suppression:number;cover:number;detection:DetectionState;
 groupId:number;formationSlot:number;objective:Vec2;aiState:'Recon'|'Approach'|'Contact'|'Suppress'|'Maneuver'|'Breach'|'Assault'|'Hold'|'Return';
 disabled:boolean;destroyed:boolean;passengers:number;endurance:number;turnaround:number;selected:boolean;veterancy:number;medicBusy:boolean;setupTimer:number;
}
export interface BarrierInstance{id:number;a:Vec2;b:Vec2;hp:number;maxHp:number;gate:boolean;cover:number;destroyed:boolean}
export interface TerrainPatch{id:number;kind:'Trees'|'Brush'|'Rock'|'Berm'|'Ruin'|'Ditch'|'Grass'|'Road'|'Mud'|'Water'|'Crater';x:number;y:number;rx:number;ry:number;cover:number;concealment:number;blocksLOS:boolean;vehiclePassable:boolean;move:number;elevation:number}
export interface Projectile{id:number;kind:'Bullet'|'Tracer'|'Shell'|'Missile'|'Rocket';from:Vec2;to:Vec2;progress:number;speed:number;damage:number;targetId:number|null;splash:number;side:'Friendly'|'Enemy'}
export interface Effect{id:number;kind:'Muzzle'|'Explosion'|'Smoke'|'Dust'|'Spark'|'Fire'|'Impact';pos:Vec2;age:number;life:number;size:number;rotation:number}
export interface ContactEvent{id:number;text:string;priority:'Routine'|'Warning'|'Critical';age:number}
export interface GameState{settings:GameSettings;credits:number;phase:number;score:number;elapsed:number}
export interface UpgradeView{def:UpgradeDefinition;level:number;lockedReason:string;cost:number;effectNow:string}
