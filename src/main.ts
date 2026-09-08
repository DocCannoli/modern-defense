import './style.css';
import { factions } from './data/factions';
import { difficultyDescriptions } from './data/difficulty';
import { towers, buildableKinds } from './data/towers';
import type { Difficulty, TowerKind } from './data/types';
import { Game } from './game/Game';
import { realisticMatchup } from './systems/balance';
import { loadSaves, saveCampaign } from './systems/save';

const root=document.querySelector<HTMLDivElement>('#app')!;
let game:Game|null=null;let raf=0;let last=performance.now();let selectedDifficulty:Difficulty='Normal';
const LAST_FACTION='modern-defense-last-faction';

function factionOptions(selected:string){return factions.map(f=>`<option value="${f.id}" ${f.id===selected?'selected':''}>${f.name}</option>`).join('');}
function setupScreen(){
  const previous=game?.settings.playerFaction.id||localStorage.getItem(LAST_FACTION)||'united-states';
  cancelAnimationFrame(raf);game=null;const saves=loadSaves();
  root.innerHTML=`<main class="menu-app"><div class="menu-shell">
    <h1>MODERN DEFENSE</h1><p class="subtitle">Modern military outpost defense · v0.2.0 gameplay overhaul</p>
    <section class="card setup-grid">
      <label>Your faction<select id="playerFaction">${factionOptions(previous)}</select></label>
      <label>Enemy faction<select id="enemyFaction">${factionOptions(previous==='russia'?'united-states':'russia')}</select></label>
      <label>Branch appearance<select id="branch"></select></label>
      <label>Campaign mission<select id="mission"></select></label>
    </section>
    <h3>Difficulty</h3><div id="difficulties" class="difficulty-grid"></div><div id="matchup" class="toast"></div>
    <section class="card progress-card"><strong>Campaign progress</strong><div id="saveInfo" class="muted"></div></section>
    <button id="start" class="primary start-button">Start Mission</button>
    <p class="footer">Landscape is the intended phone layout. Portrait remains supported.</p>
  </div></main>`;
  const pf=root.querySelector<HTMLSelectElement>('#playerFaction')!,ef=root.querySelector<HTMLSelectElement>('#enemyFaction')!,branch=root.querySelector<HTMLSelectElement>('#branch')!,mission=root.querySelector<HTMLSelectElement>('#mission')!;
  function updateMission(){const s=loadSaves()[pf.value];const unlocked=Math.max(1,Math.min(10,s?.mission||1));mission.innerHTML=Array.from({length:10},(_,i)=>`<option value="${i+1}" ${i+1===unlocked?'selected':''}>Mission ${i+1}${i+1>unlocked?' · locked':''}</option>`).join('');root.querySelector('#saveInfo')!.textContent=s?`Unlocked through Mission ${unlocked} · ${s.factionPoints} Faction Points saved`:'No campaign progress yet for this faction.';}
  function updateBranch(){const f=factions.find(x=>x.id===pf.value)!;branch.innerHTML=f.branchOptions.map(x=>`<option>${x}</option>`).join('');}
  function updateDiff(){const all:Difficulty[]=['Easy','Normal','Hard','Veteran','Realistic'];const box=root.querySelector('#difficulties')!;box.innerHTML=all.map(d=>`<button class="difficulty ${d===selectedDifficulty?'active':''}" data-d="${d}"><strong>${d}</strong><small>${difficultyDescriptions[d]}</small></button>`).join('');box.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>{selectedDifficulty=b.dataset.d as Difficulty;updateDiff();updateMatch();});}
  function updateMatch(){const p=factions.find(x=>x.id===pf.value)!,e=factions.find(x=>x.id===ef.value)!;root.querySelector('#matchup')!.innerHTML=`<strong>${p.name} vs ${e.name}</strong> · Realistic matchup: <strong>${realisticMatchup(p,e)}</strong>`;}
  pf.onchange=()=>{localStorage.setItem(LAST_FACTION,pf.value);updateBranch();updateMission();updateMatch();};ef.onchange=updateMatch;updateBranch();updateMission();updateDiff();updateMatch();
  root.querySelector<HTMLButtonElement>('#start')!.onclick=()=>{const s=loadSaves()[pf.value];const unlocked=Math.max(1,Math.min(10,s?.mission||1));if(Number(mission.value)>unlocked){alert(`Mission ${mission.value} is locked. Complete Mission ${unlocked} first.`);return;}startGame({playerFaction:factions.find(x=>x.id===pf.value)!,enemyFaction:factions.find(x=>x.id===ef.value)!,difficulty:selectedDifficulty,branch:branch.value,mission:Number(mission.value)});};
}

function startGame(settings:any){
  localStorage.setItem(LAST_FACTION,settings.playerFaction.id);
  root.innerHTML=`<main class="game-app"><div class="game-shell">
    <div class="topbar"><span class="brand">MODERN DEFENSE</span><span id="credits" class="pill"></span><span id="wave" class="pill"></span><span id="factions" class="pill faction-pill"></span><button id="menu" class="secondary">Menu</button></div>
    <div id="stage" class="stage"><canvas id="battle" width="1600" height="900"></canvas><div id="context" class="context-popover hidden"></div><div id="enemyCard" class="enemy-card hidden"></div></div>
    <div class="bottom-ui"><div id="build" class="build-strip"></div><div class="controls"><button id="nextWave" class="primary">Start Wave</button><button class="secondary speed" data-s="1">1×</button><button class="secondary speed" data-s="2">2×</button><button class="secondary speed" data-s="3">3×</button><button id="pause" class="secondary">Pause</button><button id="active" class="active-power"></button></div></div>
  </div></main>`;
  const canvas=root.querySelector<HTMLCanvasElement>('#battle')!;game=new Game(canvas,settings);game.onUpdate=updateUI;game.onGameOver=()=>{updateUI();setTimeout(()=>alert('Command Post destroyed — mission failed.'),40);};game.onVictory=()=>{const all=loadSaves();const prev=all[settings.playerFaction.id]||{factionId:settings.playerFaction.id,mission:1,factionPoints:0,upgrades:{}};const earned=2+settings.mission;saveCampaign({...prev,mission:Math.min(10,Math.max(prev.mission,settings.mission+1)),factionPoints:prev.factionPoints+earned});updateUI();setTimeout(()=>alert(`Mission complete! Campaign saved. +${earned} Faction Points`),40);};
  root.querySelector('#menu')!.addEventListener('click',setupScreen);root.querySelector('#nextWave')!.addEventListener('click',()=>game?.startWave());root.querySelector('#pause')!.addEventListener('click',()=>{if(game){game.paused=!game.paused;updateUI();}});root.querySelectorAll<HTMLButtonElement>('.speed').forEach(b=>b.onclick=()=>{if(game){game.speed=Number(b.dataset.s);updateUI();}});root.querySelector('#active')!.addEventListener('click',()=>game?.useActive());
  const build=root.querySelector('#build')!;build.innerHTML=buildableKinds.map(k=>`<button data-k="${k}" title="${towers[k].description}"><span>${shortLabel(k)}</span><small>${towers[k].baseCost} cr</small></button>`).join('');build.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>game?.build(b.dataset.k as TowerKind));
  last=performance.now();loop(last);updateUI();
}

function shortLabel(k:TowerKind){const m:Record<TowerKind,string>={Command:'CP',Medical:'MED',Repair:'REP',Infantry:'INF',MachineGun:'MG',Precision:'PREC',Indirect:'MTR',AntiArmor:'AT',AirDefense:'AD',CounterUAS:'C-UAS',Recon:'RECON',Engineering:'ENG',Fortification:'FORT'};return m[k];}
function upgradeCost(kind:TowerKind,level:number){const base=Math.max(250,towers[kind].baseCost);const mult=level===0?.25:level===1?.4:level===2?.65:level===3?1:1.35**(level-3);return Math.round(base*mult);}

function updateUI(){
  if(!game)return;root.querySelector('#credits')!.textContent=`${Math.floor(game.credits)} CR`;root.querySelector('#wave')!.textContent=`W${game.wave}${game.waveActive?' · ACTIVE':''}`;root.querySelector('#factions')!.textContent=`${game.settings.playerFaction.name} vs ${game.settings.enemyFaction.name}`;
  const nw=root.querySelector<HTMLButtonElement>('#nextWave')!;nw.disabled=game.waveActive||game.gameOver;nw.textContent=game.victory?'Complete':game.gameOver?'Lost':game.waveActive?'Wave Active':`Wave ${game.wave+1}`;
  root.querySelector<HTMLButtonElement>('#pause')!.textContent=game.paused?'Resume':'Pause';root.querySelectorAll<HTMLButtonElement>('.speed').forEach(b=>b.classList.toggle('selected',Number(b.dataset.s)===game!.speed));
  root.querySelectorAll<HTMLButtonElement>('#build button').forEach(b=>{const k=b.dataset.k as TowerKind;const built=game!.towers.some(t=>t.def.kind===k);b.disabled=built||game!.credits<towers[k].baseCost||game!.gameOver;b.classList.toggle('built',built);if(built)b.querySelector('small')!.textContent='BUILT';});
  const ap=root.querySelector<HTMLButtonElement>('#active')!;ap.disabled=game.activeCooldown>0||game.gameOver;ap.innerHTML=`<strong>${game.settings.playerFaction.activePower.name}</strong><small>${game.activeCooldown>0?game.activeCooldown.toFixed(0)+'s':'READY'}</small>`;
  renderContext();
}

function renderContext(){
  if(!game)return;const pop=root.querySelector<HTMLDivElement>('#context')!,enemy=root.querySelector<HTMLDivElement>('#enemyCard')!;pop.classList.add('hidden');enemy.classList.add('hidden');const obj=game.getSelected() as any;if(!obj)return;
  if(game.selected?.type==='enemy'){
    enemy.innerHTML=`<strong>${obj.def.label}</strong><span>${obj.faction.name}</span><span>HP ${Math.max(0,Math.round(obj.hp))}/${Math.round(obj.maxHp)}</span><span>${obj.status} · ${obj.def.armor} armor</span><span>${obj.troopCount} troops · ${obj.crewCount} crew · ${obj.def.manned?'Manned':'Unmanned'}</span>${obj.cover>0?'<span>Using cover/concealment</span>':''}`;enemy.classList.remove('hidden');return;
  }
  const t=obj;const canvas=root.querySelector<HTMLCanvasElement>('#battle')!,stage=root.querySelector<HTMLDivElement>('#stage')!,cr=canvas.getBoundingClientRect(),sr=stage.getBoundingClientRect();const px=(t.pos.x/game.width)*cr.width+(cr.left-sr.left),py=(t.pos.y/game.height)*cr.height+(cr.top-sr.top);
  const target=t.targetId?game.enemies.find(e=>e.id===t.targetId):null;
  const timers=[t.reloadTimer>0?`Reload ${t.reloadTimer.toFixed(1)}s`:'',t.repairTimer>0?`Repair ${t.repairTimer.toFixed(0)}s`:'',t.casualtyTimers.length?`Medic ${Math.min(...t.casualtyTimers).toFixed(0)}s`:''].filter(Boolean).join(' · ');
  pop.innerHTML=`<div class="context-head"><strong>${t.def.label}</strong><small>${t.status}${target?' · '+target.def.label:''}</small>${timers?`<small>${timers}</small>`:''}</div><div class="radial-upgrades">${t.upgrades.map((u:any,i:number)=>`<button data-up="${i}" ${game!.credits<upgradeCost(t.def.kind,u.level)?'disabled':''}><span>${u.name}</span><small>Lv ${u.level} · ${upgradeCost(t.def.kind,u.level)} CR</small></button>`).join('')}</div>`;
  pop.style.left=`${Math.max(8,Math.min(stage.clientWidth-300,px-145))}px`;pop.style.top=`${Math.max(8,Math.min(stage.clientHeight-230,py-115))}px`;pop.classList.remove('hidden');pop.querySelectorAll<HTMLButtonElement>('[data-up]').forEach(b=>b.onclick=(ev)=>{ev.stopPropagation();game?.upgrade(t.id,Number(b.dataset.up));});
}

function loop(now:number){if(!game)return;const dt=Math.min(.033,(now-last)/1000);last=now;game.update(dt);game.draw();raf=requestAnimationFrame(loop);}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game){game.paused=true;updateUI();}});
setupScreen();
