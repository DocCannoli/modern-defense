import type { CampaignSave } from '../game/model';
const KEY='modern-defense-save-v1';
export function loadSaves():Record<string,CampaignSave>{
  try { return JSON.parse(localStorage.getItem(KEY)||'{}'); } catch { return {}; }
}
export function saveCampaign(save:CampaignSave){ const all=loadSaves(); all[save.factionId]=save; localStorage.setItem(KEY,JSON.stringify(all)); }
