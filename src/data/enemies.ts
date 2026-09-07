import type { EnemyDefinition } from './types';

export const enemies:EnemyDefinition[] = [
  {id:'rifle',label:'Rifle Squad',cls:'Infantry',hp:95,armor:'None',armament:'Light',speed:28,damage:10,attackRange:90,attackRate:1.2,troops:6,crew:0,manned:true,reward:18,color:'#d6b98c',radius:11},
  {id:'specialist',label:'Assault Specialist Team',cls:'Infantry',hp:135,armor:'Light',armament:'Medium',speed:25,damage:15,attackRange:100,attackRate:1.1,troops:4,crew:0,manned:true,reward:26,color:'#b99d77',radius:12},
  {id:'recon',label:'Recon Team',cls:'Infantry',hp:70,armor:'None',armament:'Light',speed:38,damage:8,attackRange:95,attackRate:1.0,troops:4,crew:0,manned:true,reward:15,color:'#c4aa7b',radius:9},
  {id:'light-vehicle',label:'Light Utility Vehicle',cls:'Vehicle',hp:220,armor:'Light',armament:'Light',speed:46,damage:12,attackRange:105,attackRate:1.0,troops:3,crew:2,manned:true,reward:28,color:'#8c8a74',radius:14},
  {id:'apc',label:'Armored Personnel Carrier',cls:'Vehicle',hp:430,armor:'Medium',armament:'Medium',speed:34,damage:20,attackRange:120,attackRate:1.25,troops:8,crew:3,manned:true,reward:45,color:'#747b69',radius:17},
  {id:'ifv',label:'Infantry Fighting Vehicle',cls:'Vehicle',hp:620,armor:'Medium',armament:'Heavy',speed:32,damage:28,attackRange:145,attackRate:1.2,troops:7,crew:3,manned:true,reward:60,color:'#626b58',radius:18},
  {id:'tank',label:'Main Battle Tank',cls:'Vehicle',hp:1100,armor:'Heavy',armament:'Heavy',speed:25,damage:46,attackRange:165,attackRate:1.8,troops:0,crew:3,manned:true,reward:90,color:'#52594b',radius:21},
  {id:'recon-drone',label:'Recon UAV',cls:'Aerial',hp:80,armor:'None',armament:'Light',speed:48,damage:4,attackRange:115,attackRate:1.0,troops:0,crew:0,manned:false,reward:12,color:'#9ba5ae',radius:8},
  {id:'fpv',label:'FPV Attack Drone',cls:'Aerial',hp:48,armor:'None',armament:'Specialized',speed:72,damage:95,attackRange:16,attackRate:9,troops:0,crew:0,manned:false,reward:14,color:'#b4bcc3',radius:6},
  {id:'uav',label:'Armed UAV',cls:'Aerial',hp:320,armor:'Light',armament:'Heavy',speed:42,damage:30,attackRange:170,attackRate:2.4,troops:0,crew:0,manned:false,reward:42,color:'#87939b',radius:13},
  {id:'helo',label:'Attack Helicopter',cls:'Aerial',hp:620,armor:'Light',armament:'Heavy',speed:36,damage:42,attackRange:180,attackRate:1.6,troops:0,crew:2,manned:true,reward:70,color:'#6e797e',radius:18},
];

export const enemyById = Object.fromEntries(enemies.map(e=>[e.id,e])) as Record<string,EnemyDefinition>;
