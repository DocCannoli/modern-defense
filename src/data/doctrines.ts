import type { Faction } from './types';
export interface DoctrineProfile {
  name:string; spacing:number; flankChance:number; coverUse:number; recon:number; combinedArms:number; droneUse:number; armorUse:number; suppression:number; reserveUse:number;
  aggression:number; axes:number; bounding:number; breach:number; dismountDistance:number; frontalTolerance:number; description:string;
}
const d=(name:string,spacing:number,flankChance:number,coverUse:number,recon:number,combinedArms:number,droneUse:number,armorUse:number,suppression:number,reserveUse:number,aggression:number,axes:number,bounding:number,breach:number,dismountDistance:number,frontalTolerance:number,description:string):DoctrineProfile=>({name,spacing,flankChance,coverUse,recon,combinedArms,droneUse,armorUse,suppression,reserveUse,aggression,axes,bounding,breach,dismountDistance,frontalTolerance,description});
export const doctrines:Record<string,DoctrineProfile>={
  armenia:d('Prepared defense / dispersed maneuver',42,.60,.88,.78,.65,.78,.55,.78,.76,.60,3,.65,.68,280,.42,'Cover-heavy maneuver with drones, fires, and cautious assaults.'),
  australia:d('Combined-arms maneuver',50,.78,.90,.94,.94,.86,.72,.92,.78,.67,4,.86,.90,330,.34,'Recon-led combined arms with strong bounding, engineers, and support-by-fire.'),
  azerbaijan:d('Drone-enabled maneuver',46,.72,.84,.88,.86,.98,.74,.84,.70,.76,4,.72,.82,300,.50,'UAV/loitering-munition support paired with mobile ground formations.'),
  brazil:d('Flexible light maneuver',42,.74,.94,.82,.74,.72,.48,.78,.68,.72,3,.74,.70,300,.38,'Terrain-aware infantry maneuver with air-mobile tendencies.'),
  china:d('Integrated combined arms',48,.72,.84,.92,.98,.94,.92,.92,.86,.78,4,.78,.90,350,.54,'Highly coordinated reconnaissance, fires, armor, drones, and multiple axes.'),
  colombia:d('Distributed terrain maneuver',40,.82,.98,.90,.72,.72,.36,.76,.60,.74,3,.82,.68,300,.28,'Dispersed infantry that aggressively exploits concealment and difficult terrain.'),
  egypt:d('Mechanized mass',40,.52,.72,.68,.82,.58,.86,.78,.76,.78,3,.56,.76,360,.68,'Mechanized packages with armor, infantry, and direct pressure.'),
  finland:d('Dispersed defense / counterattack',54,.88,.98,.96,.90,.84,.74,.94,.88,.60,4,.88,.84,320,.24,'Highly dispersed, cover-focused maneuver with strong fires and flanking.'),
  france:d('Collaborative combat',50,.82,.92,.95,.96,.86,.82,.92,.76,.72,4,.86,.88,340,.34,'Networked sensors and maneuver elements coordinate rapidly around contact.'),
  germany:d('Mechanized combined arms',50,.74,.88,.92,.96,.78,.94,.94,.80,.68,4,.82,.90,360,.40,'Armor and mechanized infantry mutually support with deliberate maneuver.'),
  india:d('Combined arms / massed support',44,.66,.82,.80,.90,.80,.90,.88,.82,.76,4,.70,.82,360,.58,'Balanced combined arms with strong artillery and mechanized support.'),
  iran:d('Drone and fires integration',44,.70,.88,.84,.80,1.00,.70,.86,.86,.74,4,.66,.78,320,.56,'Drone-heavy reconnaissance and strike support with dispersed ground elements.'),
  israel:d('Sensor-to-shooter maneuver',54,.88,.92,.99,.99,.98,.90,.96,.72,.82,5,.90,.94,380,.30,'Fast sensor-driven combined arms with aggressive flanking and precision support.'),
  italy:d('Joint maneuver',48,.76,.90,.90,.92,.78,.78,.88,.72,.68,4,.82,.84,330,.36,'Balanced joint maneuver with reconnaissance and deliberate bounding.'),
  japan:d('Dispersed cross-domain maneuver',50,.80,.94,.97,.94,.88,.76,.94,.84,.62,4,.84,.86,350,.28,'Dispersed mobile defense with strong sensors, unmanned support, and air defense.'),
  mexico:d('Light mobile security maneuver',38,.66,.92,.72,.60,.58,.28,.68,.58,.66,3,.64,.58,260,.42,'Light forces favor mobility, cover, and infantry-centric attacks.'),
  'north-korea':d('Massing and infiltration',34,.42,.70,.56,.70,.64,.80,.76,.86,.90,4,.42,.72,300,.88,'Higher frontal tolerance, mass, infiltration, and strong reliance on fires.'),
  pakistan:d('Balanced combined arms',44,.70,.84,.84,.86,.78,.84,.86,.74,.76,4,.72,.80,330,.50,'Balanced mechanized and infantry maneuver with supporting fires.'),
  philippines:d('Light terrain maneuver',38,.82,.98,.82,.66,.76,.30,.72,.60,.66,3,.80,.62,270,.26,'Dispersed infantry uses terrain, flanking, and light mobile support.'),
  poland:d('Mechanized defense / obstacle integration',50,.78,.90,.94,.96,.84,.94,.94,.88,.72,4,.82,.94,360,.38,'Mechanized maneuver integrates engineers, obstacles, artillery, and drones.'),
  russia:d('Reconnaissance-strike / massed fires',40,.58,.78,.86,.94,.96,.98,.98,.92,.88,4,.58,.86,420,.72,'Reconnaissance, EW, drones, heavy fires, and mechanized pressure with reserves.'),
  'saudi-arabia':d('Mechanized / air-supported maneuver',46,.68,.76,.86,.88,.72,.82,.86,.74,.70,3,.70,.78,360,.52,'Mechanized ground forces supported by strong air and sensor capability.'),
  'south-korea':d('High-tempo combined arms',48,.76,.86,.94,.98,.88,.94,.96,.82,.78,4,.80,.92,360,.50,'Fast combined arms with dense fires, drones, and mechanized maneuver.'),
  sweden:d('Distributed maneuver',56,.90,.99,.98,.92,.92,.80,.96,.90,.58,4,.90,.84,340,.20,'Very dispersed, cover-aware maneuver with high-quality reconnaissance.'),
  taiwan:d('Dispersed resilient defense',48,.82,.96,.96,.90,.98,.72,.92,.88,.62,4,.84,.84,330,.28,'Dispersed infantry, drones, precision fires, and resilient defensive movement.'),
  turkey:d('UAV-enabled combined arms',48,.80,.88,.94,.94,1.00,.88,.90,.74,.80,4,.82,.88,350,.44,'UAV-supported combined arms with armor, fires, and flexible maneuver.'),
  ukraine:d('Drone-centric distributed maneuver',58,.94,1.00,1.00,.90,1.00,.70,.96,.72,.82,5,.92,.88,420,.18,'Highly dispersed groups exploit drones, concealment, FPV strikes, and rapid adaptation.'),
  'united-kingdom':d('Dispersed networked maneuver',54,.86,.96,.98,.98,.90,.80,.96,.78,.70,4,.90,.90,360,.26,'Dispersed formations connect surveillance, fires, armor, and tactical UAVs.'),
  'united-states':d('Fire and maneuver / combined arms',56,.90,.94,1.00,1.00,.94,.96,.99,.84,.82,5,.98,.96,390,.24,'Recon-led combined arms. Buddy/fire-team bounds alternate movement under suppression and support-by-fire.'),
  vietnam:d('Concealed dispersed maneuver',42,.86,.99,.88,.76,.70,.66,.86,.86,.66,3,.84,.74,280,.26,'Infantry uses concealment, dispersed approaches, fires, and deliberate flanking.'),
};
export function doctrineFor(f:Faction):DoctrineProfile{return doctrines[f.id]??d('General combined arms',46,.68,.86,.82,.82,.76,.72,.82,.72,.70,3,.72,.78,320,.44,'Balanced maneuver doctrine.');}
