import { defaultLoadout } from '../data/equipment';
import type { FactionProgress,GraphicsQuality,VoiceFrequency } from '../data/types';
const KEY='modern-defense-save-v2';const SETTINGS='modern-defense-settings-v2';
export function loadProgress():Record<string,FactionProgress>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
export function getFactionProgress(id:string):FactionProgress{const all=loadProgress();return all[id]||{factionId:id,factionPoints:0,unlocked:['regular','service-rifle','none-support','saw','iron','standard-armor','no-vehicle','no-aviation'],loadouts:[{...defaultLoadout}],campaigns:{},updatedAt:Date.now()}}
export function saveFactionProgress(p:FactionProgress){const all=loadProgress();all[p.factionId]={...p,updatedAt:Date.now()};localStorage.setItem(KEY,JSON.stringify(all))}
export interface UserSettings{graphics:GraphicsQuality;voiceFrequency:VoiceFrequency;masterVolume:number;effectsVolume:number;voiceVolume:number;uiScale:number;autoPause:boolean}
export const defaultSettings:UserSettings={graphics:'Balanced',voiceFrequency:'Normal',masterVolume:.8,effectsVolume:.8,voiceVolume:.7,uiScale:1,autoPause:false};
export function loadSettings():UserSettings{try{return {...defaultSettings,...JSON.parse(localStorage.getItem(SETTINGS)||'{}')}}catch{return {...defaultSettings}}}
export function saveSettings(s:UserSettings){localStorage.setItem(SETTINGS,JSON.stringify(s))}
