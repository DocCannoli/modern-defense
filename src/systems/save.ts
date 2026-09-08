import type { CampaignSave } from '../game/model';
const KEY='modern-defense-save-v2';
export function loadSaves():Record<string,CampaignSave>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
export function saveCampaign(save:CampaignSave){const all=loadSaves();all[save.factionId]={...save,updatedAt:Date.now()};localStorage.setItem(KEY,JSON.stringify(all));}
export function saveSettings(settings:Record<string,unknown>){localStorage.setItem('modern-defense-settings-v1',JSON.stringify(settings));}
export function loadSettings<T extends Record<string,unknown>>(fallback:T):T{try{return {...fallback,...JSON.parse(localStorage.getItem('modern-defense-settings-v1')||'{}')}}catch{return fallback}}
