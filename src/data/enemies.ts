import type { EnemyDefinition } from './types';
export const enemies:EnemyDefinition[]=[
{id:'rifle',label:'Rifle Squad',cls:'Infantry',role:'rifle',hp:110,armor:'None',armament:'Light',speed:32,damage:10,attackRange:115,attackRate:1.15,troops:7,crew:0,manned:true,reward:18,color:'#d6b98c',radius:12},
{id:'specialist',label:'Assault / Breach Team',cls:'Infantry',role:'assault',hp:150,armor:'Light',armament:'Medium',speed:29,damage:16,attackRange:105,attackRate:1.0,troops:5,crew:0,manned:true,reward:28,color:'#b99d77',radius:13},
{id:'recon',label:'Recon Team',cls:'Infantry',role:'recon',hp:78,armor:'None',armament:'Light',speed:40,damage:7,attackRange:120,attackRate:1.15,troops:4,crew:0,manned:true,reward:16,color:'#c4aa7b',radius:10},
{id:'light-vehicle',label:'Light Utility Vehicle',cls:'Vehicle',role:'transport',hp:240,armor:'Light',armament:'Light',speed:52,damage:12,attackRange:130,attackRate:1.0,troops:3,crew:2,manned:true,reward:28,color:'#8c8a74',radius:15},
{id:'apc',label:'Armored Personnel Carrier',cls:'Vehicle',role:'transport',hp:470,armor:'Medium',armament:'Medium',speed:40,damage:20,attackRange:150,attackRate:1.2,troops:8,crew:3,manned:true,reward:46,color:'#747b69',radius:18},
{id:'ifv',label:'Infantry Fighting Vehicle',cls:'Vehicle',role:'ifv',hp:680,armor:'Medium',armament:'Heavy',speed:38,damage:30,attackRange:190,attackRate:1.15,troops:7,crew:3,manned:true,reward:62,color:'#626b58',radius:19},
{id:'tank',label:'Main Battle Tank',cls:'Vehicle',role:'tank',hp:1200,armor:'Heavy',armament:'Heavy',speed:30,damage:50,attackRange:220,attackRate:1.75,troops:0,crew:3,manned:true,reward:94,color:'#52594b',radius:22},
{id:'recon-drone',label:'Recon UAV',cls:'Aerial',role:'recon-uav',hp:85,armor:'None',armament:'Light',speed:58,damage:0,attackRange:0,attackRate:0,troops:0,crew:0,manned:false,reward:12,color:'#9ba5ae',radius:8},
{id:'fpv',label:'FPV Attack Drone',cls:'Aerial',role:'one-way',hp:52,armor:'None',armament:'Specialized',speed:85,damage:105,attackRange:12,attackRate:99,troops:0,crew:0,manned:false,reward:15,color:'#b4bcc3',radius:7},
{id:'uav',label:'Armed UAV',cls:'Aerial',role:'armed-uav',hp:330,armor:'Light',armament:'Heavy',speed:48,damage:32,attackRange:250,attackRate:2.4,troops:0,crew:0,manned:false,reward:44,color:'#87939b',radius:14},
{id:'helo',label:'Attack Helicopter',cls:'Aerial',role:'helicopter',hp:650,armor:'Light',armament:'Heavy',speed:44,damage:44,attackRange:270,attackRate:1.55,troops:0,crew:2,manned:true,reward:72,color:'#6e797e',radius:19},
];
export const enemyById=Object.fromEntries(enemies.map(e=>[e.id,e])) as Record<string,EnemyDefinition>;
