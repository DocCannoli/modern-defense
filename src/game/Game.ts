import { towers, buildableKinds } from '../data/towers';
import { enemyById } from '../data/enemies';
import { difficultyRules } from '../data/difficulty';
import type { EnemyDefinition, TowerKind } from '../data/types';
import type { EnemyInstance, GameSettings, Projectile, TowerInstance, Vec2 } from './model';
import { buildWave, type SpawnOrder } from '../systems/waves';
import { factionEnemyScale, factionTowerScale } from '../systems/balance';

export class Game {
  canvas:HTMLCanvasElement; ctx:CanvasRenderingContext2D; settings:GameSettings;
  width=1000; height=650; credits=1500; wave=0; waveActive=false; waveQueue:SpawnOrder[]=[]; spawnTimer=0;
  towers:TowerInstance[]=[]; enemies:EnemyInstance[]=[]; projectiles:Projectile[]=[];
  selected:{type:'tower'|'enemy';id:number}|null=null;
  gameOver=false; victory=false; paused=false; speed=1; activeCooldown=0; activeMax=45;
  nextId=1; onUpdate:()=>void=()=>{}; onGameOver:()=>void=()=>{}; onVictory:()=>void=()=>{};
  approachPaths:Vec2[][]=[];
  constructor(canvas:HTMLCanvasElement, settings:GameSettings){
    this.canvas=canvas; this.ctx=canvas.getContext('2d')!; this.settings=settings;
    this.approachPaths=[
      [{x:10,y:130},{x:220,y:150},{x:400,y:230},{x:650,y:310},{x:820,y:330}],
      [{x:10,y:520},{x:250,y:500},{x:420,y:430},{x:650,y:350},{x:820,y:330}],
      [{x:500,y:10},{x:510,y:160},{x:600,y:240},{x:760,y:300},{x:820,y:330}],
    ];
    this.createInitialOutpost();
    this.bindCanvas();
  }
  createInitialOutpost(){
    this.addTower('Command',{x:900,y:330},false);
    this.addTower('Medical',{x:900,y:430},false);
    this.addTower('Repair',{x:900,y:230},false);
    this.addTower('Infantry',{x:760,y:410},false);
    this.addTower('MachineGun',{x:760,y:250},false);
  }
  bindCanvas(){
    this.canvas.addEventListener('pointerdown',(e)=>{
      const r=this.canvas.getBoundingClientRect(); const x=(e.clientX-r.left)*this.width/r.width; const y=(e.clientY-r.top)*this.height/r.height;
      let bestEnemy:EnemyInstance|null=null, bd=30;
      for(const en of this.enemies){const d=Math.hypot(en.pos.x-x,en.pos.y-y); if(d<bd){bestEnemy=en;bd=d;}}
      if(bestEnemy){this.selected={type:'enemy',id:bestEnemy.id};this.onUpdate();return;}
      let bestTower:TowerInstance|null=null; bd=38;
      for(const t of this.towers){const d=Math.hypot(t.pos.x-x,t.pos.y-y); if(d<bd){bestTower=t;bd=d;}}
      if(bestTower){this.selected={type:'tower',id:bestTower.id};this.onUpdate();return;}
      this.selected=null; this.onUpdate();
    });
  }
  addTower(kind:TowerKind,pos:Vec2,pay=true){
    const source=towers[kind]; const def={...source,categories:[...source.categories]}; if(pay&&this.credits<def.baseCost)return false;
    if(pay)this.credits-=def.baseCost;
    const scale=factionTowerScale(this.settings.playerFaction,this.settings.difficulty);
    const t:TowerInstance={id:this.nextId++,def,pos,hp:def.maxHp*scale,maxHp:def.maxHp*scale,status:'Idle',upgrades:def.categories.map(name=>({name,level:0})),targetId:null,cooldown:0,ammo:def.magazine,reloadTimer:0,personnel:kind==='Infantry'?4:kind==='MachineGun'?3:2,maxPersonnel:kind==='Infantry'?4:kind==='MachineGun'?3:2,casualtyTimers:[],repairTimer:0,repairCost:0};
    this.towers.push(t); this.onUpdate(); return true;
  }
  build(kind:TowerKind){
    if(!buildableKinds.includes(kind))return false;
    if(this.towers.some(t=>t.def.kind===kind))return false;
    const spots:Record<string,Vec2>={Precision:{x:720,y:130},Indirect:{x:650,y:530},AntiArmor:{x:650,y:170},AirDefense:{x:850,y:120},CounterUAS:{x:850,y:540},Recon:{x:560,y:110},Engineering:{x:930,y:535}};
    return this.addTower(kind,spots[kind]||{x:700,y:500},true);
  }
  upgrade(towerId:number,index:number){
    const t=this.towers.find(x=>x.id===towerId); if(!t)return false;
    const u=t.upgrades[index]; if(!u)return false;
    const base=t.def.baseCost||250; const mult=[.25,.4,.65,1][Math.min(u.level,3)] ?? (1.35**(u.level-3)); const cost=Math.round(base*mult);
    if(this.credits<cost)return false; this.credits-=cost; u.level++;
    const cat=u.name.toLowerCase();
    if(cat.includes('person')||cat.includes('crew')||cat.includes('team')||cat.includes('operator')){t.maxPersonnel+=1;t.personnel+=1;t.def.damage*=1.08;}
    if(cat.includes('gun count')||cat.includes('tube count')||cat.includes('launcher count')||cat==='teams'){t.def.damage*=1.12;}
    if(cat.includes('weapon')||cat.includes('ammunition')||cat.includes('interceptor')||cat.includes('defeat'))t.def.damage*=1.10;
    if(cat.includes('optic')||cat.includes('sensor')||cat.includes('observation')||cat.includes('detection'))t.def.range*=1.06;
    if(cat.includes('fire control')||cat.includes('sustain')||cat.includes('network')||cat.includes('target'))t.def.fireRate=Math.max(.08,t.def.fireRate*.94);
    t.maxHp*=1.05; t.hp=Math.min(t.maxHp,t.hp+t.maxHp*.05);
    this.onUpdate(); return true;
  }
  repair(towerId:number){
    const t=this.towers.find(x=>x.id===towerId); if(!t||t.hp>=t.maxHp||t.repairTimer>0)return false;
    const missing=1-t.hp/t.maxHp; const value=Math.max(200,t.def.baseCost)+t.upgrades.reduce((s,u)=>s+u.level*50,0);
    const pct=missing<.2?.10:missing<.4?.20:missing<.65?.35:.45; const cost=Math.max(15,Math.round(value*pct));
    if(this.credits<cost)return false; this.credits-=cost; t.repairCost=cost; const repair=this.towers.find(x=>x.def.kind==='Repair'&&x.hp>0); const repairBonus=repair?repair.upgrades.reduce((n,u)=>n+u.level,0):0; t.repairTimer=Math.max(4,8+missing*27-repairBonus*1.2); t.status='Repairing'; this.onUpdate(); return true;
  }
  startWave(){ if(this.waveActive||this.gameOver)return; this.wave++; this.waveQueue=buildWave(this.wave,this.settings.difficulty,this.settings.enemyFaction); this.waveActive=true; this.spawnTimer=.2; this.onUpdate(); }
  spawnEnemy(def:EnemyDefinition){
    const path=this.approachPaths[Math.floor(Math.random()*this.approachPaths.length)];
    const rules=difficultyRules[this.settings.difficulty]; const fs=factionEnemyScale(this.settings.enemyFaction,this.settings.difficulty);
    const hp=def.hp*rules.enemyHp*fs;
    this.enemies.push({id:this.nextId++,def,faction:this.settings.enemyFaction,pos:{...path[0]},hp,maxHp:hp,status:'Moving',pathIndex:1,attackCooldown:0,targetTowerId:null,troopCount:def.troops,crewCount:def.crew,spawnedFromVehicle:false});
    (this.enemies[this.enemies.length-1] as any).path=path;
  }
  getSelected(){ if(!this.selected)return null; return this.selected.type==='tower'?this.towers.find(t=>t.id===this.selected!.id):this.enemies.find(e=>e.id===this.selected!.id); }
  update(dt:number){
    if(this.paused||this.gameOver)return; dt*=this.speed; this.activeCooldown=Math.max(0,this.activeCooldown-dt);
    if(this.waveActive){
      this.spawnTimer-=dt;
      if(this.waveQueue.length&&this.spawnTimer<=0){const order=this.waveQueue.shift()!;this.spawnEnemy(enemyById[order.enemyId]);this.spawnTimer=order.delay;}
      if(!this.waveQueue.length&&!this.enemies.length){this.waveActive=false;this.credits+=75+this.wave*12; const goal=4+this.settings.mission; if(this.wave>=goal){this.victory=true;this.gameOver=true;this.onVictory();} this.onUpdate();}
    }
    this.updateEnemies(dt); this.updateTowers(dt); this.updateProjectiles(dt); this.onUpdate();
  }
  updateEnemies(dt:number){
    const rules=difficultyRules[this.settings.difficulty];
    for(const e of [...this.enemies]){
      if(e.hp<=0){this.killEnemy(e);continue;}
      e.attackCooldown=Math.max(0,e.attackCooldown-dt);
      const target=this.findEnemyTarget(e);
      if(target){
        const d=Math.hypot(target.pos.x-e.pos.x,target.pos.y-e.pos.y);
        if(d<=e.def.attackRange){e.status='Attacking'; if(e.attackCooldown<=0){const hit=e.def.damage*rules.enemyDamage; target.hp-=hit; if(target.personnel>0 && ['Infantry','MachineGun','Precision','Indirect','AntiArmor','AirDefense','CounterUAS'].includes(target.def.kind) && Math.random()<Math.min(.30,hit/180)){target.personnel--; const medical=this.towers.find(x=>x.def.kind==='Medical'&&x.hp>0); const medBonus=medical?medical.upgrades.reduce((n,u)=>n+u.level,0):0; target.casualtyTimers.push(Math.max(12,40-medBonus*1.5));} e.attackCooldown=e.def.attackRate; if(target.hp<=0){target.status='Destroyed'; if(target.def.kind==='Command'){this.gameOver=true;this.onGameOver();}}} continue;}
      }
      e.status='Moving'; const path=(e as any).path as Vec2[]; const p=path[e.pathIndex]; if(!p)continue;
      const dx=p.x-e.pos.x,dy=p.y-e.pos.y,d=Math.hypot(dx,dy); if(d<4){e.pathIndex++;continue;} const sp=e.def.speed*dt; e.pos.x+=dx/d*Math.min(sp,d);e.pos.y+=dy/d*Math.min(sp,d);
    }
  }
  findEnemyTarget(e:EnemyInstance){
    // Primary objective is Command Post. Enemies may engage defensive positions encountered en route.
    const command=this.towers.find(t=>t.def.kind==='Command'&&t.hp>0); let best=command||null; let bd=command?Math.hypot(command.pos.x-e.pos.x,command.pos.y-e.pos.y):Infinity;
    for(const t of this.towers){if(t.hp<=0||t.def.kind==='Medical'||t.def.kind==='Repair')continue; const d=Math.hypot(t.pos.x-e.pos.x,t.pos.y-e.pos.y); if(d<e.def.attackRange*1.2&&d<bd){best=t;bd=d;}}
    return best;
  }
  updateTowers(dt:number){
    for(const t of this.towers){
      if(t.hp<=0){t.status='Destroyed';continue;}
      if(t.repairTimer>0){t.repairTimer-=dt;if(t.repairTimer<=0){t.hp=t.maxHp;t.status='Idle';}continue;}
      t.casualtyTimers=t.casualtyTimers.map(x=>x-dt).filter(x=>{if(x<=0){t.personnel=Math.min(t.maxPersonnel,t.personnel+1);return false;}return true;});
      if(!t.def.targets.length||t.personnel<=0)continue;
      t.cooldown=Math.max(0,t.cooldown-dt); if(t.reloadTimer>0){t.reloadTimer-=dt;t.status='Reloading';if(t.reloadTimer<=0){t.ammo=t.def.magazine;t.status='Idle';}continue;}
      const valid=this.enemies.filter(e=>e.hp>0&&t.def.targets.includes(e.def.cls)&&Math.hypot(e.pos.x-t.pos.x,e.pos.y-t.pos.y)<=t.def.range);
      valid.sort((a,b)=>Math.hypot(a.pos.x-t.pos.x,a.pos.y-t.pos.y)-Math.hypot(b.pos.x-t.pos.x,b.pos.y-t.pos.y)); const e=valid[0];
      if(!e){t.status='Idle';t.targetId=null;continue;} t.targetId=e.id;t.status='Tracking';
      if(t.cooldown<=0){ if(t.ammo<=0){t.reloadTimer=t.def.reload;t.status='Reloading';continue;} t.status='Firing';t.ammo--;t.cooldown=t.def.fireRate;
        this.projectiles.push({id:this.nextId++,from:{...t.pos},to:{...e.pos},progress:0,speed:t.def.kind==='Indirect'?1.8:4.5,damage:t.def.damage,targetId:e.id,splash:t.def.kind==='Indirect'?45:0,kind:t.def.kind});
      }
    }
  }
  updateProjectiles(dt:number){
    for(const p of [...this.projectiles]){p.progress+=dt*p.speed;if(p.progress<1)continue; const target=this.enemies.find(e=>e.id===p.targetId); if(target){let dmg=p.damage; if(target.def.armor==='Heavy'&&!['AntiArmor','Indirect'].includes(p.kind))dmg*=.28; else if(target.def.armor==='Medium'&&p.kind==='Infantry')dmg*=.55; target.hp-=dmg;if(p.splash>0){for(const e of this.enemies){if(e.id!==target.id&&Math.hypot(e.pos.x-target.pos.x,e.pos.y-target.pos.y)<p.splash)e.hp-=dmg*.45;}}} this.projectiles.splice(this.projectiles.indexOf(p),1);}
  }
  killEnemy(e:EnemyInstance){
    this.credits+=e.def.reward; const idx=this.enemies.indexOf(e); if(idx>=0)this.enemies.splice(idx,1);
    if(e.def.cls==='Vehicle'&&e.def.manned&&(e.crewCount+e.troopCount)>0){
      const overkill=Math.max(0,-e.hp)/e.maxHp; const survival=Math.max(0,.72-overkill*.9-(e.status==='Burning'?.18:0)); const survivors=Math.round((e.crewCount+e.troopCount)*survival);
      if(survivors>0){const d=enemyById.rifle; const child:EnemyInstance={id:this.nextId++,def:d,faction:e.faction,pos:{...e.pos},hp:d.hp,maxHp:d.hp,status:'Moving',pathIndex:(e as any).pathIndex||1,attackCooldown:0,targetTowerId:null,troopCount:survivors,crewCount:0,spawnedFromVehicle:true};(child as any).path=(e as any).path;this.enemies.push(child);}
    }
    if(this.selected?.type==='enemy'&&this.selected.id===e.id)this.selected=null;
  }
  useActive(){
    if(this.activeCooldown>0||this.gameOver)return false; this.activeCooldown=this.activeMax;
    const type=this.settings.playerFaction.activePower.type;
    if(type==='reinforce'){for(const t of this.towers){if(['Infantry','MachineGun'].includes(t.def.kind)){t.personnel=t.maxPersonnel;t.casualtyTimers=[];}}}
    else if(type==='defense'||type==='network'){for(const t of this.towers){t.hp=Math.min(t.maxHp,t.hp+t.maxHp*.15);t.cooldown=0;}}
    else {const targets=[...this.enemies].sort((a,b)=>b.maxHp-a.maxHp).slice(0,type==='drone'?5:4);for(const e of targets)e.hp-=type==='air'?260:type==='fires'?210:180;}
    this.onUpdate(); return true;
  }
  draw(){
    const c=this.ctx;c.clearRect(0,0,this.width,this.height);c.fillStyle='#6f775e';c.fillRect(0,0,this.width,this.height);
    // roads/approaches
    c.lineCap='round';for(const path of this.approachPaths){c.strokeStyle='#77705f';c.lineWidth=34;c.beginPath();c.moveTo(path[0].x,path[0].y);for(const p of path.slice(1))c.lineTo(p.x,p.y);c.stroke();c.strokeStyle='#948b77';c.lineWidth=3;c.stroke();}
    // outpost perimeter
    c.strokeStyle='#c8b97a';c.lineWidth=5;c.setLineDash([16,8]);c.strokeRect(610,70,360,500);c.setLineDash([]);
    for(const t of this.towers)this.drawTower(t); for(const e of this.enemies)this.drawEnemy(e); for(const p of this.projectiles)this.drawProjectile(p);
  }
  drawTower(t:TowerInstance){const c=this.ctx;const sel=this.selected?.type==='tower'&&this.selected.id===t.id;c.save();c.translate(t.pos.x,t.pos.y); if(sel){c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(0,0,29,0,Math.PI*2);c.stroke();}
    c.fillStyle=t.hp<=0?'#3b3b3b':t.def.kind==='Command'?'#334155':t.def.kind==='Medical'?'#ece7d5':t.def.kind==='Repair'?'#4b5563':'#46513f';c.fillRect(-22,-18,44,36);c.fillStyle='#222';c.font='11px sans-serif';c.textAlign='center';c.fillText(t.def.label.replace(' Defense','').replace(' / EW',''),0,34);c.fillStyle='#1f2937';c.fillRect(-24,-27,48,5);c.fillStyle=t.hp/t.maxHp>.4?'#92b36f':'#c66';c.fillRect(-24,-27,48*(Math.max(0,t.hp)/t.maxHp),5);
    // visible personnel/equipment additions
    const extra=Math.min(6,Math.max(0,t.maxPersonnel-2));c.fillStyle='#27301f';for(let i=0;i<extra;i++){c.beginPath();c.arc(-18+i*7, -24-(i%2)*5,3,0,Math.PI*2);c.fill();} c.restore();}
  drawEnemy(e:EnemyInstance){const c=this.ctx;const sel=this.selected?.type==='enemy'&&this.selected.id===e.id;c.save();c.translate(e.pos.x,e.pos.y);if(sel){c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(0,0,e.def.radius+6,0,Math.PI*2);c.stroke();}c.fillStyle=e.def.color;if(e.def.cls==='Vehicle')c.fillRect(-e.def.radius,-e.def.radius*.65,e.def.radius*2,e.def.radius*1.3);else if(e.def.cls==='Aerial'){c.beginPath();c.moveTo(0,-e.def.radius);c.lineTo(e.def.radius,e.def.radius);c.lineTo(-e.def.radius,e.def.radius);c.closePath();c.fill();}else{c.beginPath();c.arc(0,0,e.def.radius,0,Math.PI*2);c.fill();}c.fillStyle='#1f2937';c.fillRect(-16,-e.def.radius-9,32,4);c.fillStyle='#d25b5b';c.fillRect(-16,-e.def.radius-9,32*Math.max(0,e.hp/e.maxHp),4);c.restore();}
  drawProjectile(p:Projectile){const c=this.ctx;const x=p.from.x+(p.to.x-p.from.x)*p.progress,y=p.from.y+(p.to.y-p.from.y)*p.progress;c.fillStyle=p.kind==='Indirect'?'#2d2d2d':'#f3d98b';c.beginPath();c.arc(x,y,p.kind==='Indirect'?4:2,0,Math.PI*2);c.fill();}
}
