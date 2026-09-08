import type { BuildingDefinition,BuildingKind,UpgradeDefinition } from './types';
export const buildings:Record<BuildingKind,BuildingDefinition>={
 Command:{kind:'Command',name:'Command Post',baseCost:0,description:'Mission command, reconnaissance, fortifications, support and battlefield intelligence.',produces:[]},
 Infantry:{kind:'Infantry',name:'Infantry Facility',baseCost:350,description:'Fields rifle squads, MG teams, mortar teams, precision teams, AT teams, medics and engineers.',produces:['rifle','mg','mortar','precision','at','engineer']},
 AirDefense:{kind:'AirDefense',name:'Air Defense Facility',baseCost:500,description:'Fields ground air-defense, counter-UAS and electronic-defense teams.',produces:['sam','cuas']},
 MotorPool:{kind:'MotorPool',name:'Motor Pool',baseCost:650,description:'Fields armored, transport, reconnaissance, engineering and recovery vehicles.',produces:['tank','ifv','apc','recon-vehicle','recovery']},
 Aviation:{kind:'Aviation',name:'Aviation Facility',baseCost:750,description:'Launches helicopters, reconnaissance UAVs, armed UAVs and defensive drones.',produces:['recon-drone','armed-drone','interceptor-drone','helicopter']},
};
export const buildableBuildings:BuildingKind[]=['Infantry','AirDefense','MotorPool','Aviation'];
export const upgrades:UpgradeDefinition[]=[
 {id:'cp-recon-1',name:'Observation Network',building:'Command',kind:'recon',cost:250,requires:[],description:'Improves detection and identification for every friendly unit.',effect:'Detection +18%; effective engagement range +10% up to each weapon maximum.',maxLevel:3},
 {id:'cp-fort-1',name:'Basic Fighting Positions',building:'Command',kind:'fortification',cost:220,requires:[],description:'Constructs prepared positions around the objective.',effect:'Adds sandbag fighting positions and +18% cover in them.',maxLevel:1},
 {id:'cp-fort-2',name:'Overhead Cover',building:'Command',kind:'fortification',cost:360,requires:['cp-fort-1'],description:'Hardens prepared positions against indirect fire.',effect:'Prepared positions gain +25% explosive protection.',maxLevel:1},
 {id:'cp-fort-3',name:'Hardened Perimeter',building:'Command',kind:'fortification',cost:520,requires:['cp-fort-1'],description:'Adds stronger perimeter barriers and hardened gates.',effect:'Perimeter durability +50%; adds vehicle obstacles at main approaches.',maxLevel:1},
 {id:'cp-command-1',name:'Battle Management',building:'Command',kind:'command',cost:300,requires:[],description:'Speeds target handoff and support coordination.',effect:'Friendly reaction time -12%; active support cooldown -10%.',maxLevel:3},
 {id:'inf-squad',name:'Additional Rifle Squad',building:'Infantry',kind:'organization',cost:420,requires:[],description:'Adds another complete rifle squad using the current infantry loadout.',effect:'Rifle squad capacity +1.',maxLevel:3},
 {id:'inf-mg-gun',name:'Additional MG per Team',building:'Infantry',kind:'equipment',cost:280,requires:['inf-squad'],description:'Adds one machine gun to each MG team when manpower can support it.',effect:'MG weapons/team +1; requires enough crew personnel.',maxLevel:2},
 {id:'inf-mortar-tube',name:'Additional Mortar Tube',building:'Infantry',kind:'equipment',cost:340,requires:['inf-squad'],description:'Adds one mortar tube to each mortar team when crew strength allows.',effect:'Mortar tubes/team +1; requires enough crew personnel.',maxLevel:2},
 {id:'inf-personnel',name:'Personnel Expansion',building:'Infantry',kind:'personnel',cost:300,requires:[],description:'Expands authorized manpower for weapon teams and specialist roles.',effect:'Infantry team personnel capacity +2.',maxLevel:3},
 {id:'ad-team',name:'Additional Air-Defense Team',building:'AirDefense',kind:'organization',cost:520,requires:[],description:'Adds a complete additional air-defense team.',effect:'Air-defense team capacity +1.',maxLevel:2},
 {id:'ad-launcher',name:'Additional Launcher per Team',building:'AirDefense',kind:'equipment',cost:460,requires:['ad-team'],description:'Adds another launcher/system to each eligible air-defense team.',effect:'Weapons/team +1 if crew requirement is met.',maxLevel:2},
 {id:'mp-bay',name:'Additional Vehicle Bay',building:'MotorPool',kind:'capacity',cost:600,requires:[],description:'Expands the number of vehicles that may be fielded from the Motor Pool.',effect:'Vehicle capacity +1.',maxLevel:3},
 {id:'mp-recovery',name:'Recovery Section',building:'MotorPool',kind:'equipment',cost:450,requires:['mp-bay'],description:'Adds battlefield vehicle recovery and faster disabled-vehicle repair.',effect:'Disabled vehicle recovery enabled; repair rate +30%.',maxLevel:1},
 {id:'av-sortie',name:'Additional Sortie Capacity',building:'Aviation',kind:'capacity',cost:650,requires:[],description:'Allows another aviation unit to be active or cycling through rearm/refuel.',effect:'Aviation capacity +1.',maxLevel:2},
 {id:'av-ground',name:'Improved Ground Support',building:'Aviation',kind:'equipment',cost:480,requires:['av-sortie'],description:'Speeds rearm/refuel turnaround.',effect:'Aviation turnaround time -20%.',maxLevel:2},
];
