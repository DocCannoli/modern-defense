import { towers, buildableKinds } from '../data/towers';
import { enemyById } from '../data/enemies';
import { difficultyRules } from '../data/difficulty';
import { doctrineFor } from '../data/doctrines';
import type { EnemyDefinition, TowerKind } from '../data/types';
import type { EnemyInstance, GameSettings, Projectile, TowerInstance, Vec2 } from './model';
import { buildWave, type SpawnOrder } from '../systems/waves';
import { factionEnemyScale, factionTowerScale } from '../systems/balance';

interface TerrainPatch {x:number;y:number;r:number;kind:'trees'|'brush'|'rocks'|'berm'|'ruin';cover:number}

export class Game {
  canvas:HTMLCanvasElement; ctx:CanvasRenderingContext2D; settings:GameSettings;
  width=1600; height=900; credits=1500; wave=0; waveActive=false; waveQueue:SpawnOrder[]=[]; spawnTimer=0;
  towers:TowerInstance[]=[]; enemies:EnemyInstance[]=[]; projectiles:Projectile[]=[];
  selected:{type:'tower'|'enemy';id:number}|null=null;
  gameOver=false; victory=false; paused=false; speed=1; activeCooldown=0; activeMax=45;
  nextId=1; onUpdate:()=>void=()=>{}; onGameOver:()=>void=()=>{}; onVictory:()=>void=()=>{};
  terrain:TerrainPatch[]=[]; elapsed=0;
  base={x:610,y:275,w:380,h:350};
  slots:Record<TowerKind,Vec2>={
    Command:{x:800,y:450}, Medical:{x:885,y:525}, Repair:{x:885,y:375}, Infantry:{x:720,y:520}, MachineGun:{x:720,y:380},
    Precision:{x:665,y:335}, Indirect:{x:800,y:565}, AntiArmor:{x:665,y:565}, AirDefense:{x:930,y:335}, CounterUAS:{x:930,y:565},
    Recon:{x:800,y:335}, Engineering:{x:865,y:450}, Fortification:{x:735,y:450}
  };
  guardSlots:Partial<Record<TowerKind,Vec2>>={
    Infantry:{x:610,y:555},MachineGun:{x:610,y:360},Precision:{x:660,y:275},Indirect:{x:800,y:625},AntiArmor:{x:990,y:555},AirDefense:{x:990,y:335},CounterUAS:{x:930,y:625}
  };

  constructor(canvas:HTMLCanvasElement, settings:GameSettings){
    this.canvas=canvas;this.ctx=canvas.getContext('2d')!;this.settings=settings;
    this.createTerrain();this.createInitialOutpost();this.bindCanvas();
  }

  createTerrain(){
    const pts:[number,number,number,TerrainPatch['kind'],number][]=[
      [190,170,78,'trees',.24],[360,115,54,'brush',.14],[520,175,62,'rocks',.22],[1120,145,70,'trees',.24],[1370,220,65,'brush',.14],
      [180,690,82,'trees',.24],[390,760,64,'brush',.14],[520,675,56,'berm',.20],[1120,730,72,'rocks',.22],[1370,650,86,'trees',.24],
      [270,410,58,'ruin',.28],[1280,430,70,'ruin',.28],[420,390,42,'brush',.14],[1180,520,50,'berm',.20]
    ];
    this.terrain=pts.map(([x,y,r,kind,cover])=>({x,y,r,kind,cover}));
  }

  createInitialOutpost(){
    for(const k of ['Command','Medical','Repair','Infantry','MachineGun'] as TowerKind[]) this.addTower(k,false);
  }

  bindCanvas(){
    this.canvas.addEventListener('pointerdown',(e)=>{
      const r=this.canvas.getBoundingClientRect();const x=(e.clientX-r.left)*this.width/r.width;const y=(e.clientY-r.top)*this.height/r.height;
      let be:EnemyInstance|null=null,bd=34;
      for(const en of this.enemies){const d=Math.hypot(en.pos.x-x,en.pos.y-y);if(d<bd){be=en;bd=d;}}
      if(be){this.selected={type:'enemy',id:be.id};this.onUpdate();return;}
      let bt:TowerInstance|null=null;bd=48;
      for(const t of this.towers){const d=Math.min(Math.hypot(t.pos.x-x,t.pos.y-y),Math.hypot(t.homePos.x-x,t.homePos.y-y));if(d<bd){bt=t;bd=d;}}
      if(bt){this.selected={type:'tower',id:bt.id};this.onUpdate();return;}
      this.selected=null;this.onUpdate();
    });
  }

  addTower(kind:TowerKind,pay=true){
    if(this.towers.some(t=>t.def.kind===kind))return false;
    const source=towers[kind];const def={...source,categories:[...source.categories]};if(pay&&this.credits<def.baseCost)return false;
    if(pay)this.credits-=def.baseCost;
    const scale=factionTowerScale(this.settings.playerFaction,this.settings.difficulty);
    const home={...this.slots[kind]};const guard=this.guardSlots[kind];const pos=guard?{...guard}:{...home};
    const basePersonnel=kind==='Infantry'?8:kind==='MachineGun'?4:['Precision','AntiArmor','AirDefense','CounterUAS','Indirect'].includes(kind)?3:2;
    const t:TowerInstance={id:this.nextId++,def,pos,homePos:home,hp:def.maxHp*scale,maxHp:def.maxHp*scale,status:guard?'Deploying':'Idle',upgrades:def.categories.map(name=>({name,level:0})),targetId:null,cooldown:0,ammo:def.magazine,reloadTimer:0,personnel:basePersonnel,maxPersonnel:basePersonnel,casualtyTimers:[],repairTimer:0,repairCost:0,deployTimer:guard?2.4:0,damagedAt:-999};
    this.towers.push(t);this.onUpdate();return true;
  }

  build(kind:TowerKind){if(!buildableKinds.includes(kind))return false;return this.addTower(kind,true);}

  upgrade(towerId:number,index:number){
    const t=this.towers.find(x=>x.id===towerId);if(!t)return false;const u=t.upgrades[index];if(!u)return false;
    const base=Math.max(250,t.def.baseCost);const mult=u.level===0?.25:u.level===1?.4:u.level===2?.65:u.level===3?1:1.35**(u.level-3);const cost=Math.round(base*mult);
    if(this.credits<cost)return false;this.credits-=cost;u.level++;
    const cat=u.name.toLowerCase();
    if(/person|crew|team|operator|staff|observer|engineer|medical/.test(cat)){t.maxPersonnel+=1;t.personnel+=1;t.def.damage*=1.08;}
    if(/gun count|tube count|launcher count|teams|capacity/.test(cat))t.def.damage*=1.12;
    if(/weapon|ammunition|interceptor|defeat|equipment/.test(cat))t.def.damage*=1.10;
    if(/optic|sensor|observation|detection|communications|intelligence/.test(cat))t.def.range*=1.07;
    if(/fire control|sustain|network|target|battle management/.test(cat))t.def.fireRate=Math.max(.08,t.def.fireRate*.94);
    t.maxHp*=1.05;t.hp=Math.min(t.maxHp,t.hp+t.maxHp*.05);this.onUpdate();return true;
  }

  startWave(){if(this.waveActive||this.gameOver)return;this.wave++;this.waveQueue=buildWave(this.wave,this.settings.difficulty,this.settings.enemyFaction);this.waveActive=true;this.spawnTimer=.3;this.onUpdate();}

  buildPath(order:SpawnOrder,def:EnemyDefinition):Vec2[]{
    const doc=doctrineFor(this.settings.enemyFaction);const axis=order.lane%5;
    const starts=[{x:45,y:170},{x:45,y:730},{x:800,y:45},{x:1555,y:180},{x:1555,y:720}];
    const gates=[{x:610,y:360},{x:610,y:540},{x:800,y:275},{x:990,y:360},{x:990,y:540}];
    const s={...starts[axis]},g={...gates[axis]};
    const spacing=doc.spacing;const row=(order.groupId%4)-1.5;const spread=(Math.random()-.5)*spacing*2+row*spacing;
    if(axis<2||axis>2)s.y+=spread;else s.x+=spread;
    const path:Vec2[]=[s];
    const coverChoices=this.terrain.filter(t=>Math.hypot(t.x-s.x,t.y-s.y)<900&&Math.hypot(t.x-g.x,t.y-g.y)>180);
    if(def.cls==='Infantry'&&coverChoices.length&&Math.random()<doc.coverUse){
      const c=coverChoices[(order.groupId+axis)%coverChoices.length];path.push({x:c.x+(Math.random()-.5)*c.r,y:c.y+(Math.random()-.5)*c.r});
    }
    const flank=Math.random()<doc.flankChance;const mx=(s.x+g.x)/2,my=(s.y+g.y)/2;
    if(flank){const ox=axis===2?(Math.random()<.5?-180:180):(axis<2?110:-110);const oy=axis===2?120:(axis===0||axis===3?-130:130);path.push({x:mx+ox,y:my+oy});}
    else if(Math.random()>doc.roadBias)path.push({x:mx+(Math.random()-.5)*160,y:my+(Math.random()-.5)*160});
    path.push(g,{x:800,y:450});return path;
  }

  spawnEnemy(def:EnemyDefinition,order:SpawnOrder){
    const rules=difficultyRules[this.settings.difficulty],fs=factionEnemyScale(this.settings.enemyFaction,this.settings.difficulty);const hp=def.hp*rules.enemyHp*fs;const path=this.buildPath(order,def);
    this.enemies.push({id:this.nextId++,def,faction:this.settings.enemyFaction,pos:{...path[0]},hp,maxHp:hp,status:'Moving',pathIndex:1,attackCooldown:0,targetTowerId:null,troopCount:def.troops,crewCount:def.crew,spawnedFromVehicle:false,path,groupId:order.groupId,cover:0,lane:order.lane});
  }

  getSelected(){if(!this.selected)return null;return this.selected.type==='tower'?this.towers.find(t=>t.id===this.selected!.id):this.enemies.find(e=>e.id===this.selected!.id);}

  update(dt:number){
    if(this.paused||this.gameOver)return;dt*=this.speed;this.elapsed+=dt;this.activeCooldown=Math.max(0,this.activeCooldown-dt);
    if(this.waveActive){this.spawnTimer-=dt;if(this.waveQueue.length&&this.spawnTimer<=0){const o=this.waveQueue.shift()!;this.spawnEnemy(enemyById[o.enemyId],o);this.spawnTimer=o.delay;}if(!this.waveQueue.length&&!this.enemies.length){this.waveActive=false;this.credits+=85+this.wave*14;const goal=4+this.settings.mission;if(this.wave>=goal){this.victory=true;this.gameOver=true;this.onVictory();}}}
    this.updateSupport(dt);this.updateEnemies(dt);this.updateTowers(dt);this.updateProjectiles(dt);this.onUpdate();
  }

  updateSupport(dt:number){
    const repair=this.towers.find(t=>t.def.kind==='Repair'&&t.hp>0);if(repair){const lvl=repair.upgrades.reduce((s,u)=>s+u.level,0);const capacity=1+Math.floor(lvl/4);const damaged=this.towers.filter(t=>t.hp>0&&t.hp<t.maxHp&&t.def.kind!=='Repair').sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp).slice(0,capacity);for(const t of damaged){const rate=(5+lvl*.8)*dt;t.hp=Math.min(t.maxHp,t.hp+rate);t.repairTimer=(t.maxHp-t.hp)/(5+lvl*.8);}}
    const med=this.towers.find(t=>t.def.kind==='Medical'&&t.hp>0);const medLvl=med?med.upgrades.reduce((s,u)=>s+u.level,0):0;
    for(const t of this.towers){t.casualtyTimers=t.casualtyTimers.map(x=>x-dt*(1+medLvl*.06)).filter(x=>{if(x<=0){t.personnel=Math.min(t.maxPersonnel,t.personnel+1);return false;}return true;});}
  }

  updateEnemies(dt:number){
    const rules=difficultyRules[this.settings.difficulty],doc=doctrineFor(this.settings.enemyFaction);
    for(const e of [...this.enemies]){
      if(e.hp<=0){this.killEnemy(e);continue;}e.attackCooldown=Math.max(0,e.attackCooldown-dt);
      e.cover=0;for(const t of this.terrain){if(Math.hypot(t.x-e.pos.x,t.y-e.pos.y)<t.r)e.cover=Math.max(e.cover,t.cover);}
      const target=this.findEnemyTarget(e);if(target){const d=Math.hypot(target.pos.x-e.pos.x,target.pos.y-e.pos.y);if(d<=e.def.attackRange){e.status='Attacking';if(e.attackCooldown<=0){const hit=e.def.damage*rules.enemyDamage*(.88+doc.suppression*.18);target.hp-=hit;target.damagedAt=this.elapsed;if(target.personnel>0&&towers[target.def.kind].targets.length&&Math.random()<Math.min(.24,hit/210)){target.personnel--;target.casualtyTimers.push(Math.max(8,18-Math.random()*4));}e.attackCooldown=e.def.attackRate;if(target.hp<=0){target.status='Destroyed';if(target.def.kind==='Command'){this.gameOver=true;this.onGameOver();}}}continue;}}
      e.status='Moving';const p=e.path[e.pathIndex];if(!p)continue;const dx=p.x-e.pos.x,dy=p.y-e.pos.y,d=Math.hypot(dx,dy);if(d<7){e.pathIndex++;continue;}const sp=e.def.speed*dt*(.92+doc.aggression*.18);e.pos.x+=dx/d*Math.min(sp,d);e.pos.y+=dy/d*Math.min(sp,d);
    }
  }

  findEnemyTarget(e:EnemyInstance){
    const command=this.towers.find(t=>t.def.kind==='Command'&&t.hp>0);let best=command||null,bd=command?Math.hypot(command.pos.x-e.pos.x,command.pos.y-e.pos.y):Infinity;
    for(const t of this.towers){if(t.hp<=0||['Medical','Repair','Fortification'].includes(t.def.kind))continue;const d=Math.hypot(t.pos.x-e.pos.x,t.pos.y-e.pos.y);if(d<e.def.attackRange*1.35&&d<bd){best=t;bd=d;}}
    return best;
  }

  updateTowers(dt:number){
    for(const t of this.towers){
      if(t.hp<=0){t.status='Destroyed';continue;}if(t.deployTimer>0){t.deployTimer-=dt;t.status='Deploying';continue;}
      if(!t.def.targets.length||t.personnel<=0){if(t.repairTimer>0)t.status='Repairing';else t.status='Idle';continue;}
      t.cooldown=Math.max(0,t.cooldown-dt);if(t.reloadTimer>0){t.reloadTimer-=dt;t.status='Reloading';if(t.reloadTimer<=0){t.ammo=t.def.magazine;t.status='Idle';}continue;}
      const valid=this.enemies.filter(e=>e.hp>0&&t.def.targets.includes(e.def.cls)&&Math.hypot(e.pos.x-t.pos.x,e.pos.y-t.pos.y)<=t.def.range);
      valid.sort((a,b)=>{const pa=(a.def.cls==='Aerial'?20:0)+(a.def.armor==='Heavy'?15:0);const pb=(b.def.cls==='Aerial'?20:0)+(b.def.armor==='Heavy'?15:0);return pb-pa||Math.hypot(a.pos.x-t.pos.x,a.pos.y-t.pos.y)-Math.hypot(b.pos.x-t.pos.x,b.pos.y-t.pos.y);});
      const e=valid[0];if(!e){t.status=t.repairTimer>0?'Repairing':'Idle';t.targetId=null;continue;}t.targetId=e.id;t.status='Tracking';
      if(t.cooldown<=0){if(t.ammo<=0){t.reloadTimer=t.def.reload;t.status='Reloading';continue;}t.status='Firing';t.ammo--;t.cooldown=t.def.fireRate;this.projectiles.push({id:this.nextId++,from:{...t.pos},to:{...e.pos},progress:0,speed:t.def.kind==='Indirect'?1.7:5.2,damage:t.def.damage,targetId:e.id,splash:t.def.kind==='Indirect'?72:0,kind:t.def.kind});}
    }
  }

  updateProjectiles(dt:number){
    for(const p of [...this.projectiles]){p.progress+=dt*p.speed;if(p.progress<1)continue;const target=this.enemies.find(e=>e.id===p.targetId);if(target){let dmg=p.damage*(1-target.cover*.55);if(target.def.armor==='Heavy'&&!['AntiArmor','Indirect'].includes(p.kind))dmg*=.28;else if(target.def.armor==='Medium'&&p.kind==='Infantry')dmg*=.55;target.hp-=dmg;if(p.splash>0){for(const e of this.enemies){if(e.id!==target.id&&Math.hypot(e.pos.x-target.pos.x,e.pos.y-target.pos.y)<p.splash)e.hp-=dmg*.45;}}}this.projectiles.splice(this.projectiles.indexOf(p),1);}
  }

  killEnemy(e:EnemyInstance){
    this.credits+=e.def.reward;const idx=this.enemies.indexOf(e);if(idx>=0)this.enemies.splice(idx,1);
    if(e.def.cls==='Vehicle'&&e.def.manned&&(e.crewCount+e.troopCount)>0){const over=Math.max(0,-e.hp)/e.maxHp,survival=Math.max(0,.72-over*.9);const survivors=Math.round((e.crewCount+e.troopCount)*survival);if(survivors>0){const d=enemyById.rifle;this.enemies.push({id:this.nextId++,def:d,faction:e.faction,pos:{...e.pos},hp:d.hp,maxHp:d.hp,status:'Moving',pathIndex:e.pathIndex,attackCooldown:0,targetTowerId:null,troopCount:survivors,crewCount:0,spawnedFromVehicle:true,path:e.path,groupId:e.groupId,cover:0,lane:e.lane});}}
    if(this.selected?.type==='enemy'&&this.selected.id===e.id)this.selected=null;
  }

  useActive(){if(this.activeCooldown>0||this.gameOver)return false;this.activeCooldown=this.activeMax;const type=this.settings.playerFaction.activePower.type;if(type==='reinforce'){for(const t of this.towers){if(['Infantry','MachineGun'].includes(t.def.kind)){t.personnel=t.maxPersonnel;t.casualtyTimers=[];}}}else if(type==='defense'||type==='network'){for(const t of this.towers){t.hp=Math.min(t.maxHp,t.hp+t.maxHp*.15);t.cooldown=0;}}else{const targets=[...this.enemies].sort((a,b)=>b.maxHp-a.maxHp).slice(0,type==='drone'?6:5);for(const e of targets)e.hp-=type==='air'?300:type==='fires'?240:200;}this.onUpdate();return true;}

  draw(){
    const c=this.ctx;c.clearRect(0,0,this.width,this.height);c.fillStyle='#87906f';c.fillRect(0,0,this.width,this.height);
    this.drawTerrain(c);this.drawRoads(c);this.drawBase(c);this.drawProjectiles(c);this.drawEnemies(c);this.drawTowers(c);
  }

  drawTerrain(c:CanvasRenderingContext2D){
    for(const t of this.terrain){
      if(t.kind==='trees'){c.fillStyle='#47603f';for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.arc(t.x+Math.cos(a)*t.r*.45,t.y+Math.sin(a)*t.r*.35,t.r*.28,0,Math.PI*2);c.fill();}}
      else if(t.kind==='brush'){c.fillStyle='#6d774f';c.beginPath();c.ellipse(t.x,t.y,t.r,t.r*.55,0,0,Math.PI*2);c.fill();}
      else if(t.kind==='rocks'){c.fillStyle='#696b62';for(let i=0;i<4;i++)c.fillRect(t.x-t.r/2+i*18,t.y-t.r/3+(i%2)*15,30,24);}
      else if(t.kind==='berm'){c.strokeStyle='#756b50';c.lineWidth=16;c.beginPath();c.arc(t.x,t.y,t.r*.72,.25,Math.PI-.25);c.stroke();}
      else {c.fillStyle='#77766c';c.fillRect(t.x-t.r*.55,t.y-t.r*.3,t.r*1.1,t.r*.6);c.fillStyle='#87906f';c.fillRect(t.x-10,t.y-t.r*.3,22,t.r*.35);}
    }
  }

  drawRoads(c:CanvasRenderingContext2D){c.strokeStyle='#7b7463';c.lineWidth=26;c.lineCap='round';const roads=[[{x:0,y:450},{x:610,y:450}],[{x:1600,y:450},{x:990,y:450}],[{x:800,y:0},{x:800,y:275}]];for(const r of roads){c.beginPath();c.moveTo(r[0].x,r[0].y);c.lineTo(r[1].x,r[1].y);c.stroke();}}

  drawBase(c:CanvasRenderingContext2D){
    const b=this.base;c.fillStyle='#69705e';c.fillRect(b.x,b.y,b.w,b.h);c.strokeStyle='#b7b09b';c.lineWidth=6;c.setLineDash([15,8]);
    const fort=this.towers.find(t=>t.def.kind==='Fortification');const lvl=fort?fort.upgrades.reduce((s,u)=>s+u.level,0):0;c.lineWidth=6+Math.min(8,lvl*.6);
    c.strokeRect(b.x,b.y,b.w,b.h);c.setLineDash([]);c.fillStyle='#55594b';for(const g of [{x:610,y:360},{x:610,y:540},{x:800,y:275},{x:990,y:360},{x:990,y:540}])c.fillRect(g.x-16,g.y-16,32,32);
    c.fillStyle='#d7d1b6';c.font='bold 16px system-ui';c.fillText('OUTPOST',b.x+12,b.y+24);
  }

  drawProjectiles(c:CanvasRenderingContext2D){for(const p of this.projectiles){const x=p.from.x+(p.to.x-p.from.x)*p.progress,y=p.from.y+(p.to.y-p.from.y)*p.progress;c.fillStyle=p.kind==='Indirect'?'#f3c76a':'#ffe6a8';c.beginPath();c.arc(x,y,p.kind==='Indirect'?4:2,0,Math.PI*2);c.fill();}}

  drawEnemies(c:CanvasRenderingContext2D){
    for(const e of this.enemies){const x=e.pos.x,y=e.pos.y,r=e.def.radius;c.save();c.translate(x,y);
      if(e.def.cls==='Infantry'){c.fillStyle='#5a4637';for(let i=0;i<Math.min(4,Math.max(1,Math.ceil(e.troopCount/2)));i++){const ox=(i%2)*9-4,oy=Math.floor(i/2)*10-5;c.beginPath();c.arc(ox,oy-5,3,0,Math.PI*2);c.fill();c.fillRect(ox-2,oy-2,4,9);}}
      else if(e.def.cls==='Vehicle'){c.fillStyle=e.def.color;c.fillRect(-r,-r*.55,r*2,r*1.1);c.fillStyle='#30362f';c.fillRect(-r*.55,-r*.72,r*1.1,r*.35);if(e.def.id==='tank'){c.beginPath();c.arc(0,-2,r*.45,0,Math.PI*2);c.fill();c.fillRect(0,-4,r*1.1,5);}}
      else {c.strokeStyle='#41484c';c.lineWidth=4;if(e.def.id==='helo'){c.beginPath();c.moveTo(-r*1.3,0);c.lineTo(r*1.3,0);c.stroke();c.fillStyle='#59666d';c.fillRect(-r*.7,-6,r*1.4,12);}else{c.beginPath();c.moveTo(-r,0);c.lineTo(r,0);c.moveTo(0,-r);c.lineTo(0,r);c.stroke();c.fillStyle='#666f75';c.fillRect(-4,-4,8,8);}}
      c.restore();const w=34;c.fillStyle='#4b1717';c.fillRect(x-w/2,y-r-13,w,4);c.fillStyle='#d45c4f';c.fillRect(x-w/2,y-r-13,w*Math.max(0,e.hp/e.maxHp),4);if(e.cover>0){c.fillStyle='#203a24';c.font='10px system-ui';c.fillText('COVER',x-18,y+r+16);}
    }
  }

  drawTowers(c:CanvasRenderingContext2D){
    for(const t of this.towers){const selected=this.selected?.type==='tower'&&this.selected.id===t.id;if(selected&&t.def.range>0){c.strokeStyle='rgba(215,227,151,.75)';c.fillStyle='rgba(215,227,151,.07)';c.lineWidth=2;c.beginPath();c.arc(t.pos.x,t.pos.y,t.def.range,0,Math.PI*2);c.fill();c.stroke();}
      if(Math.hypot(t.homePos.x-t.pos.x,t.homePos.y-t.pos.y)>5){c.strokeStyle='#4d5147';c.lineWidth=2;c.setLineDash([5,5]);c.beginPath();c.moveTo(t.homePos.x,t.homePos.y);c.lineTo(t.pos.x,t.pos.y);c.stroke();c.setLineDash([]);this.drawStructureIcon(c,t.homePos.x,t.homePos.y,t.def.kind,true);}
      this.drawStructureIcon(c,t.pos.x,t.pos.y,t.def.kind,false);const r=18;c.fillStyle='#471b1b';c.fillRect(t.pos.x-22,t.pos.y+r+9,44,5);c.fillStyle='#70a96b';c.fillRect(t.pos.x-22,t.pos.y+r+9,44*Math.max(0,t.hp/t.maxHp),5);
      let timer='';if(t.reloadTimer>0)timer=`RLD ${t.reloadTimer.toFixed(1)}`;else if(t.repairTimer>0)timer=`REP ${t.repairTimer.toFixed(0)}`;else if(t.casualtyTimers.length)timer=`MED ${Math.min(...t.casualtyTimers).toFixed(0)}`;else if(t.deployTimer>0)timer=`MOVE ${t.deployTimer.toFixed(1)}`;if(timer){c.fillStyle='#10202a';c.font='bold 11px system-ui';c.fillText(timer,t.pos.x-24,t.pos.y-28);}
    }
  }

  drawStructureIcon(c:CanvasRenderingContext2D,x:number,y:number,kind:TowerKind,small:boolean){
    const s=small?16:22;c.save();c.translate(x,y);c.fillStyle='#c8c3aa';c.strokeStyle='#232b2c';c.lineWidth=2;c.fillRect(-s,-s*.7,s*2,s*1.4);c.strokeRect(-s,-s*.7,s*2,s*1.4);c.fillStyle='#1f292b';c.font=`bold ${small?9:11}px system-ui`;c.textAlign='center';
    const labels:Record<TowerKind,string>={Command:'CP',Medical:'+',Repair:'🔧',Infantry:'INF',MachineGun:'MG',Precision:'DMR',Indirect:'MTR',AntiArmor:'AT',AirDefense:'AD',CounterUAS:'EW',Recon:'ISR',Engineering:'ENG',Fortification:'FORT'};
    c.fillText(labels[kind],0,4);if(!small&&['MachineGun','Precision','AntiArmor'].includes(kind)){c.beginPath();c.moveTo(0,-s*.2);c.lineTo(s*1.5,-s*.55);c.stroke();}if(!small&&kind==='Indirect'){c.beginPath();c.moveTo(-3,4);c.lineTo(8,-s*1.2);c.stroke();}if(!small&&kind==='AirDefense'){c.beginPath();c.arc(0,-4,s*.7,Math.PI,0);c.stroke();}
    c.restore();
  }
}
