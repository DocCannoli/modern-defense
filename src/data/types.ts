export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Veteran' | 'Realistic';
export type TowerKind = 'Command' | 'Medical' | 'Repair' | 'Infantry' | 'MachineGun' | 'Precision' | 'Indirect' | 'AntiArmor' | 'AirDefense' | 'CounterUAS' | 'Recon' | 'Engineering';
export type EnemyClass = 'Infantry' | 'Vehicle' | 'Aerial';
export type ArmorLevel = 'None' | 'Light' | 'Medium' | 'Heavy';
export type ArmamentLevel = 'Light' | 'Medium' | 'Heavy' | 'Specialized';
export type EnemyStatus = 'Moving' | 'Attacking' | 'Suppressed' | 'Wounded' | 'Disabled' | 'Immobilized' | 'Burning' | 'Jammed' | 'Destroyed';
export type TowerStatus = 'Idle' | 'Tracking' | 'Firing' | 'Reloading' | 'Repairing' | 'Disabled' | 'Destroyed';

export interface Faction {
  id: string;
  name: string;
  branchOptions: string[];
  activePower: { name: string; description: string; type: 'fires' | 'air' | 'drone' | 'defense' | 'network' | 'reinforce' };
  realistic: {
    offense: number;
    defense: number;
    air: number;
    armor: number;
    drones: number;
    infantry: number;
  };
}

export interface DifficultyRules {
  enemyHp: number;
  enemyDamage: number;
  enemyCount: number;
  advancedWaveOffset: number;
  balancedFactions: boolean;
}

export interface UpgradeCategory {
  name: string;
  level: number;
}

export interface TowerDefinition {
  kind: TowerKind;
  label: string;
  baseCost: number;
  range: number;
  damage: number;
  fireRate: number;
  magazine: number;
  reload: number;
  maxHp: number;
  targets: EnemyClass[];
  categories: string[];
  description: string;
}

export interface EnemyDefinition {
  id: string;
  label: string;
  cls: EnemyClass;
  hp: number;
  armor: ArmorLevel;
  armament: ArmamentLevel;
  speed: number;
  damage: number;
  attackRange: number;
  attackRate: number;
  troops: number;
  crew: number;
  manned: boolean;
  reward: number;
  color: string;
  radius: number;
}
