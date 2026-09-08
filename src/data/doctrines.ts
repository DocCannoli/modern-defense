import type { Faction } from './types';

export interface DoctrineProfile {
  spacing:number; flankChance:number; roadBias:number; coverUse:number; reconLead:number;
  combinedArms:number; droneUse:number; armorUse:number; suppression:number; reserveUse:number;
  aggression:number; axes:number;
}

const d=(spacing:number,flankChance:number,roadBias:number,coverUse:number,reconLead:number,combinedArms:number,droneUse:number,armorUse:number,suppression:number,reserveUse:number,aggression:number,axes:number):DoctrineProfile=>({spacing,flankChance,roadBias,coverUse,reconLead,combinedArms,droneUse,armorUse,suppression,reserveUse,aggression,axes});

export const doctrines:Record<string,DoctrineProfile>={
  armenia:d(34,.48,.34,.82,.72,.62,.72,.52,.72,.70,.58,2),
  australia:d(46,.72,.24,.86,.92,.92,.84,.70,.88,.78,.66,3),
  azerbaijan:d(40,.66,.32,.78,.84,.84,.96,.72,.80,.66,.76,3),
  brazil:d(38,.62,.25,.88,.76,.72,.68,.48,.74,.66,.72,3),
  china:d(42,.68,.30,.78,.88,.96,.90,.88,.90,.84,.78,4),
  colombia:d(34,.74,.18,.94,.86,.70,.70,.34,.76,.62,.72,3),
  egypt:d(36,.46,.48,.66,.66,.76,.58,.82,.74,.72,.74,3),
  finland:d(48,.82,.16,.96,.94,.88,.82,.72,.90,.86,.62,4),
  france:d(46,.76,.22,.88,.92,.94,.82,.78,.90,.76,.72,4),
  germany:d(44,.70,.26,.84,.90,.94,.76,.88,.92,.78,.68,3),
  india:d(38,.58,.38,.78,.76,.86,.76,.84,.84,.78,.76,4),
  iran:d(38,.62,.30,.82,.80,.74,.98,.64,.82,.80,.74,4),
  israel:d(48,.82,.16,.88,.96,.98,.96,.86,.94,.74,.82,4),
  italy:d(44,.70,.24,.86,.88,.90,.76,.74,.86,.72,.68,3),
  japan:d(46,.72,.20,.88,.94,.94,.84,.72,.92,.82,.62,3),
  mexico:d(32,.58,.32,.88,.66,.56,.56,.30,.64,.58,.68,2),
  'north-korea':d(28,.34,.56,.62,.54,.66,.60,.78,.72,.84,.90,4),
  pakistan:d(38,.62,.34,.80,.80,.82,.74,.78,.82,.74,.78,3),
  philippines:d(32,.72,.18,.94,.78,.62,.72,.26,.70,.62,.66,3),
  poland:d(44,.72,.24,.84,.90,.94,.82,.90,.92,.84,.72,4),
  russia:d(34,.48,.46,.70,.78,.92,.92,.94,.94,.88,.84,4),
  'saudi-arabia':d(42,.62,.36,.68,.82,.84,.70,.76,.82,.72,.74,3),
  'south-korea':d(42,.68,.28,.80,.90,.96,.84,.90,.94,.84,.78,4),
  sweden:d(50,.84,.14,.96,.96,.90,.88,.76,.92,.88,.58,4),
  taiwan:d(42,.74,.22,.90,.94,.90,.94,.68,.90,.86,.66,4),
  turkey:d(42,.72,.24,.82,.90,.90,.98,.84,.88,.72,.80,4),
  ukraine:d(52,.88,.10,.98,.98,.86,1.00,.64,.92,.74,.82,5),
  'united-kingdom':d(48,.78,.18,.90,.94,.96,.86,.76,.92,.78,.72,4),
  'united-states':d(50,.82,.16,.90,.98,1.00,.92,.92,.96,.82,.80,5),
  vietnam:d(36,.78,.16,.96,.84,.70,.66,.62,.82,.84,.66,3),
};

export function doctrineFor(f:Faction):DoctrineProfile{
  return doctrines[f.id] ?? d(40,.60,.25,.80,.75,.80,.75,.70,.80,.75,.72,3);
}
