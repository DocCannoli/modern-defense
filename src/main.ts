import './style.css';
import { factions } from './data/factions';
import { difficultyDescriptions } from './data/difficulty';
import { towers, buildableKinds } from './data/towers';
import type { Difficulty, TowerKind } from './data/types';
import { Game } from './game/Game';
import { realisticMatchup } from './systems/balance';
import { loadSaves, saveCampaign } from './systems/save';

const root=document.querySelector<HTMLDivElement>('#app')!;
let game:Game|null=null;let raf=0;let last=performance.now();
let selectedDifficulty:Difficulty='Normal';

function factionOptions(selected='united-states'){return factions.map(f=>`<option value="${f.id}" ${f.id===selected?'selected':''}>${f.name}</option>`).join('');}
function setupScreen(){
  cancelAnimationFrame(raf);game=null;
  const saves=loadSaves();
  root.innerHTML=`<main class="app"><div class="shell">
    <h1 class="title">MODERN DEFENSE</h1><p class="subtitle">Modern military outpost defense · v0.1.0 playtest</p>
    <section class="card grid setup">
      <div class="field"><label>Your faction</label><select id="playerFaction">${factionOptions()}</select></div>
      <div class="field"><label>Enemy faction</label><select id="enemyFaction">${factionOptions('russia')}</select></div>
      <div class="field"><label>Branch appearance</label><select id="branch"></select></div>
      <div class="field"><label>Campaign mission</label><select id="mission">${Array.from({length:10},(_,i)=>`<option value="${i+1}">Mission ${i+1}</option>`).join('')}</select></div>
    </section>
    <h3>Difficulty</h3><div id="difficulties" class="difficulty-grid"></div>
    <div id="matchup" class="toast"></div>
    <section class="card" style="margin-top:10px"><div class="panel-title">Campaign progression</div><div class="mission-list">${Array.from({length:10},(_,i)=>`<div class="mission">${i+1}<br><span class="muted">${i<2?'Light':i<4?'Mechanized':i<6?'Combined':i<8?'Advanced':'Full-spectrum'}</span></div>`).join('')}</div><p class="muted">Persistent faction upgrades are saved locally after victories. This playtest provides the campaign structure and progression hooks; values can be tuned after your first playtest.</p></section>
    <button id="start" class="primary" style="width:100%;margin-top:12px">Start Mission</button>
    <p class="footer">Designed for iPhone, Android, and desktop browsers. Landscape recommended on phones.</p>
  </div></main>`;
  const pf=root.querySelector<HTMLSelectElement>('#playerFaction')!,ef=root.querySelector<HTMLSelectElement>('#enemyFaction')!,branch=root.querySelector<HTMLSelectElement>('#branch')!,mission=root.querySelector<HTMLSelectElement>('#mission')!;
  const saved=saves[pf.value]; if(saved)mission.value=String(Math.min(10,saved.mission));
  function updateBranch(){const f=factions.find(x=>x.id===pf.value)!;branch.innerHTML=f.branchOptions.map(x=>`<option>${x}</option>`).join('');}
  function updateDiff(){const box=root.querySelector('#difficulties')!;const all:Difficulty[]=['Easy','Normal','Hard','Veteran','Realistic'];box.innerHTML=all.map(d=>`<button class="difficulty ${d===selectedDifficulty?'active':''}" data-d="${d}"><strong>${d}</strong><small>${difficultyDescriptions[d]}</small></button>`).join('');box.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>{selectedDifficulty=b.dataset.d as Difficulty;updateDiff();updateMatch();});}
  function updateMatch(){const p=factions.find(x=>x.id===pf.value)!,e=factions.find(x=>x.id===ef.value)!;const r=realisticMatchup(p,e);root.querySelector('#matchup')!.innerHTML=`<strong>${p.name} vs ${e.name}</strong><br>Realistic matchup estimate: <strong>${r}</strong>${selectedDifficulty==='Realistic'?'<br><span class="muted">Realistic mode uses this natural faction matchup as the baseline.</span>':'<br><span class="muted">Selected difficulty balances the factions for normal gameplay.</span>'}`;}
  pf.onchange=()=>{updateBranch();updateMatch();const s=loadSaves()[pf.value];if(s)mission.value=String(Math.min(10,s.mission));};ef.onchange=updateMatch;updateBranch();updateDiff();updateMatch();
  root.querySelector<HTMLButtonElement>('#start')!.onclick=()=>startGame({playerFaction:factions.find(x=>x.id===pf.value)!,enemyFaction:factions.find(x=>x.id===ef.value)!,difficulty:selectedDifficulty,branch:branch.value,mission:Number(mission.value)});
}

function startGame(settings:any){
  root.innerHTML=`<main class="app"><div class="shell"><div class="hud"><span class="pill"><strong>Modern Defense</strong></span><span id="credits" class="pill"></span><span id="wave" class="pill"></span><span id="factions" class="pill"></span><button id="menu" class="secondary">Menu</button></div>
  <div class="game-layout"><div><div class="battle-wrap"><canvas id="battle" width="1000" height="650"></canvas></div><div class="controls" style="margin-top:8px"><button id="nextWave" class="primary">Start Wave</button><button class="secondary speed" data-s="1">1×</button><button class="secondary speed" data-s="2">2×</button><button class="secondary speed" data-s="3">3×</button><button id="pause" class="secondary">Pause</button></div></div>
  <aside class="side"><section class="card wide"><div class="panel-title">Faction Power</div><button id="active" class="active-power"></button></section><section class="card"><div class="panel-title">Build</div><div id="build" class="build-grid"></div></section><section class="card"><div class="panel-title">Selection</div><div id="selection" class="muted">Tap a friendly position or enemy unit.</div></section><section class="card wide"><div class="panel-title">Mission</div><div id="missionInfo"></div></section></aside></div></div></main>`;
  const canvas=root.querySelector<HTMLCanvasElement>('#battle')!;game=new Game(canvas,settings);game.onUpdate=updateUI;game.onGameOver=()=>{updateUI();setTimeout(()=>alert('Command Post destroyed — mission failed.'),50);};game.onVictory=()=>{const all=loadSaves();const prev=all[settings.playerFaction.id]||{factionId:settings.playerFaction.id,mission:1,factionPoints:0,upgrades:{}};const earned=2+settings.mission;saveCampaign({...prev,mission:Math.min(10,Math.max(prev.mission,settings.mission+1)),factionPoints:prev.factionPoints+earned});updateUI();setTimeout(()=>alert(`Mission complete! +${earned} Faction Points`),50);};
  root.querySelector('#menu')!.addEventListener('click',setupScreen);root.querySelector('#nextWave')!.addEventListener('click',()=>game?.startWave());root.querySelector('#pause')!.addEventListener('click',()=>{if(game){game.paused=!game.paused;updateUI();}});root.querySelectorAll<HTMLButtonElement>('.speed').forEach(b=>b.onclick=()=>{if(game){game.speed=Number(b.dataset.s);updateUI();}});root.querySelector('#active')!.addEventListener('click',()=>game?.useActive());
  const build=root.querySelector('#build')!;build.innerHTML=buildableKinds.map(k=>`<button data-k="${k}">${towers[k].label}<br><span class="muted">${towers[k].baseCost} cr</span></button>`).join('');build.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>game?.build(b.dataset.k as TowerKind));
  last=performance.now();loop(last);
}

function upgradeCost(kind:TowerKind,level:number){const base=towers[kind].baseCost||250;const mult=level===0?.25:level===1?.4:level===2?.65:level===3?1:1.35**(level-3);return Math.round(base*mult);}
function updateUI(){if(!game)return;root.querySelector('#credits')!.textContent=`Credits: ${Math.floor(game.credits)}`;root.querySelector('#wave')!.textContent=`Wave ${game.wave}${game.waveActive?' · Active':''}`;root.querySelector('#factions')!.textContent=`${game.settings.playerFaction.name} vs ${game.settings.enemyFaction.name}`;
  const nw=root.querySelector<HTMLButtonElement>('#nextWave')!;nw.disabled=game.waveActive||game.gameOver;nw.textContent=game.victory?'Mission Complete':game.gameOver?'Mission Lost':game.waveActive?'Wave Active':`Start Wave ${game.wave+1}`;
  root.querySelector<HTMLButtonElement>('#pause')!.textContent=game.paused?'Resume':'Pause';root.querySelectorAll<HTMLButtonElement>('.speed').forEach(b=>b.style.outline=Number(b.dataset.s)===game!.speed?'2px solid #d0b15d':'');
  root.querySelectorAll<HTMLButtonElement>('#build button').forEach(b=>{const k=b.dataset.k as TowerKind;b.disabled=game!.towers.some(t=>t.def.kind===k)||game!.credits<towers[k].baseCost||game!.gameOver;});
  const ap=root.querySelector<HTMLButtonElement>('#active')!;ap.disabled=game.activeCooldown>0||game.gameOver;ap.innerHTML=`<strong>${game.settings.playerFaction.activePower.name}</strong><br><span class="muted">${game.settings.playerFaction.activePower.description}</span><br>${game.activeCooldown>0?`Ready in <span class="timer">${game.activeCooldown.toFixed(1)}s</span>`:'READY'}`;
  root.querySelector('#missionInfo')!.innerHTML=`<div class="statline"><span>Mission</span><strong>${game.settings.mission}/10</strong></div><div class="statline"><span>Difficulty</span><strong>${game.settings.difficulty}</strong></div><div class="statline"><span>Branch appearance</span><strong>${game.settings.branch}</strong></div><div class="statline"><span>Realistic matchup</span><strong>${realisticMatchup(game.settings.playerFaction,game.settings.enemyFaction)}</strong></div><div class="statline"><span>Mission waves</span><strong>${Math.min(game.wave,4+game.settings.mission)}/${4+game.settings.mission}</strong></div>`;
  const sel=root.querySelector('#selection')!;const obj=game.getSelected() as any;if(!obj){sel.innerHTML='Tap a friendly position or enemy unit.';return;}
  if(game.selected?.type==='enemy'){sel.innerHTML=`<div class="statline"><span>Unit</span><strong>${obj.def.label}</strong></div><div class="statline"><span>Country / branch</span><strong>${obj.faction.name}</strong></div><div class="statline"><span>Health</span><strong>${Math.max(0,Math.round(obj.hp))}/${Math.round(obj.maxHp)}</strong></div><div class="statline"><span>Status</span><strong>${obj.status}</strong></div><div class="statline"><span>Armor</span><strong>${obj.def.armor}</strong></div><div class="statline"><span>Armament</span><strong>${obj.def.armament}</strong></div><div class="statline"><span>Troops</span><strong>${obj.troopCount}</strong></div><div class="statline"><span>Crew</span><strong>${obj.crewCount}</strong></div><div class="statline"><span>Control</span><strong>${obj.def.manned?'Manned':'Unmanned'}</strong></div>`;}
  else {const target=obj.targetId?game.enemies.find(e=>e.id===obj.targetId):null;let html=`<div class="statline"><span>Position</span><strong>${obj.def.label}</strong></div><div class="statline"><span>Health</span><strong>${Math.max(0,Math.round(obj.hp))}/${Math.round(obj.maxHp)}</strong></div><div class="statline"><span>Status</span><strong>${obj.status}</strong></div><div class="statline"><span>Personnel</span><strong>${obj.personnel}/${obj.maxPersonnel}</strong></div><div class="statline"><span>Target</span><strong>${target?.def.label||'None'}</strong></div>${obj.reloadTimer>0?`<div class="statline"><span>Reload</span><strong class="timer">${obj.reloadTimer.toFixed(1)}s</strong></div>`:''}${obj.repairTimer>0?`<div class="statline"><span>Repair</span><strong class="timer">${obj.repairTimer.toFixed(1)}s</strong></div>`:''}${obj.casualtyTimers.length?`<div class="statline"><span>Replacement</span><strong class="timer">${Math.min(...obj.casualtyTimers).toFixed(1)}s</strong></div>`:''}<div class="statline"><span>Range</span><strong>${Math.round(obj.def.range)}</strong></div>`;
    if(obj.upgrades?.length){html+=`<div class="panel-title" style="margin-top:8px">Upgrades</div><div class="upgrade-list">${obj.upgrades.map((u:any,i:number)=>`<div class="upgrade-row"><span>${u.name} · Lv ${u.level}</span><button data-up="${i}">${upgradeCost(obj.def.kind,u.level)} cr</button></div>`).join('')}</div>`;} if(obj.hp<obj.maxHp)html+=`<button id="repairBtn" class="secondary" style="width:100%;margin-top:8px">Repair</button>`; sel.innerHTML=html;sel.querySelectorAll<HTMLButtonElement>('[data-up]').forEach(b=>b.onclick=()=>game?.upgrade(obj.id,Number(b.dataset.up)));sel.querySelector<HTMLButtonElement>('#repairBtn')?.addEventListener('click',()=>game?.repair(obj.id));}
}

function loop(now:number){if(!game)return;const dt=Math.min(.033,(now-last)/1000);last=now;game.update(dt);game.draw();raf=requestAnimationFrame(loop);}

document.addEventListener('visibilitychange',()=>{if(document.hidden&&game){game.paused=true;updateUI();}});
setupScreen();
