export type Difficulty='Easy'|'Normal'|'Hard'|'Veteran'|'Realistic';
export type MissionType='BaseDefense'|'FieldDefense'|'Assault'|'Escort'|'Seize'|'Delay';
export type BuildingKind='Command'|'Infantry'|'AirDefense'|'MotorPool'|'Aviation';
export type UnitDomain='Infantry'|'Vehicle'|'Aerial';
export type UnitRole='Rifle'|'MachineGun'|'Mortar'|'Precision'|'AntiArmor'|'Engineer'|'SAM'|'CounterUAS'|'Tank'|'IFV'|'APC'|'ReconVehicle'|'RecoveryVehicle'|'ReconDrone'|'ArmedDrone'|'InterceptorDrone'|'Helicopter';
export type UnitOrder='Hold'|'Move'|'Defend'|'Overwatch'|'SupportByFire'|'Assault'|'Breach'|'Fallback'|'Escort';
export type DetectionState='Undetected'|'Suspected'|'Detected'|'Identified'|'Tracked';
export type ContactClass='Infantry'|'Vehicle'|'Aerial';
export type UpgradeKind='personnel'|'equipment'|'organization'|'fortification'|'recon'|'command'|'capacity';
export type GraphicsQuality='Battery'|'Balanced'|'High';
export type VoiceFrequency='Off'|'Low'|'Normal'|'High';

export interface Faction{
 id:string;name:string;branchOptions:string[];
 activePower:{name:string;description:string;type:'fires'|'air'|'drone'|'defense'|'network'|'reinforce'};
 realistic:{offense:number;defense:number;air:number;armor:number;drones:number;infantry:number};
}
export interface DifficultyRules{enemyHp:number;enemyDamage:number;enemyCount:number;advancedWaveOffset:number;balancedFactions:boolean;ai:number}
export interface DoctrineProfileLike{spacing:number;flankChance:number;coverUse:number;recon:number;combinedArms:number;droneUse:number;armorUse:number;suppression:number;reserveUse:number;aggression:number;axes:number;bounding:number;breach:number;dismountDistance:number;frontalTolerance:number}

export interface EquipmentItem{
 id:string;name:string;category:'Personnel'|'Primary'|'SupportWeapon'|'Optic'|'Armor'|'Specialist'|'Vehicle'|'Aviation'|'Support';
 fpCost:number;requires:string[];description:string;effect:string;
 stats?:Partial<{damage:number;accuracy:number;range:number;reload:number;hp:number;speed:number;crew:number;capacity:number;detection:number;medic:number;breach:number;suppression:number}>;
 factionIds?:string[];tier:number;
}
export interface LoadoutPreset{
 name:string;personnel:string;primary:string;supportWeapon:string;optic:string;armor:string;specialists:string[];
 vehicle:string;aviation:string;support:string[];
}
export interface FactionProgress{
 factionId:string;factionPoints:number;unlocked:string[];loadouts:LoadoutPreset[];campaigns:Record<string,number>;tutorialComplete?:boolean;updatedAt:number;
}
export interface UpgradeDefinition{
 id:string;name:string;building:BuildingKind;kind:UpgradeKind;cost:number;requires:string[];description:string;effect:string;maxLevel:number;
}
export interface BuildingDefinition{
 kind:BuildingKind;name:string;baseCost:number;description:string;produces:string[];
}
export interface UnitDefinition{
 id:string;name:string;domain:UnitDomain;role:UnitRole;cost:number;hp:number;speed:number;range:number;minRange?:number;damage:number;fireRate:number;magazine:number;reload:number;
 personnel:number;crewPerWeapon:number;weaponsPerTeam:number;targets:ContactClass[];radius:number;description:string;transportCapacity?:number;endurance?:number;
}
export interface MissionDefinition{
 id:string;number:number;title:string;operation:string;type:MissionType;story:string;briefing:string;primary:string;secondary:string[];waves:number;startingCredits:number;deploymentCapacity:number;
 mapTheme:'Desert'|'Temperate'|'Urban'|'Jungle'|'Snow'|'Coastal'|'Mountain';weather:string;timeOfDay:string;enemyEscalation:number;playerRole:string;enemyRole:string;
}
export interface CampaignDefinition{playerId:string;enemyId:string;title:string;synopsis:string;missions:MissionDefinition[]}
export interface GameSettings{
 playerFaction:Faction;enemyFaction:Faction;difficulty:Difficulty;branch:string;mission:MissionDefinition;loadout:LoadoutPreset;tutorial?:boolean;
 graphics:GraphicsQuality;voiceFrequency:VoiceFrequency;masterVolume:number;effectsVolume:number;voiceVolume:number;uiScale:number;autoPause:boolean;
}
