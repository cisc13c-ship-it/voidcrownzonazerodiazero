/** VOIDCROWN · Expediente del Comandante (meta global entre modos) */
(function(global){
  const KEY='vc-commander-meta-v1';
  const RANKS=[
    {id:'recluta', title:'Recluta del Día Zero', xp:0, perk:null},
    {id:'alferez', title:'Alférez de la Grieta', xp:80, perk:'fuel_bonus'},
    {id:'capitan', title:'Capitán de Órbitas', xp:220, perk:'assault_dice'},
    {id:'coronel', title:'Coronel del Archivo', xp:450, perk:'smash_dmg'},
    {id:'estratega', title:'Estratega Voidcrown', xp:800, perk:'enemy_delay'},
    {id:'director', title:'Director de Caos', xp:1300, perk:'double_credits'},
    {id:'viejo', title:'Eco del Viejo', xp:2000, perk:'legend'},
  ];
  const ACHIEVEMENTS=[
    {id:'first_blood', name:'Primera sangre orbital', desc:'Gana un asalto de flota', test:s=>s.stats.assaultWins>=1, perk:'+1 garrison al capturar', title:'Rompe-mundos'},
    {id:'marathon', name:'Maratón de rutas', desc:'Recorre 100 u de distancia', test:s=>s.stats.distanceU>=100, perk:'−10% fuel en despachos', title:'Peregrino de AU'},
    {id:'planet_killer', name:'Mataplanetas', desc:'Deja un mundo en VOID en SMASH', test:s=>s.stats.worldsVoided>=1, perk:'+15% daño SMASH', title:'Dedo de Dios'},
    {id:'iron_wall', name:'Muro de hierro', desc:'Resiste 3 asaltos enemigos', test:s=>s.stats.defensesHeld>=3, perk:'+2 naves gratis/turno en Tierra', title:'Baluarte'},
    {id:'director_friend', name:'Pupilo del Director', desc:'Completa 5 misiones', test:s=>s.stats.missionsDone>=5, perk:'Misiones +20% recompensa', title:'Elegido del Genoma'},
    {id:'cartographer', name:'Cartógrafo vivo', desc:'Controla 5 mundos a la vez', test:s=>s.stats.maxWorldsOwned>=5, perk:'Vista táctica: fuel proyectado x1.05', title:'Señor del Sistema'},
    {id:'jojo_stand', name:'Stand del Comandante', desc:'Alcanza rango Capitán', test:s=>s.xp>=220, perk:'HUD grita tu título', title:'★ Menacing'},
  ];
  function def(){
    return {
      xp:0, credits:0, title:RANKS[0].title, rankId:RANKS[0].id,
      perks:{}, achievements:{},
      stats:{assaultWins:0,distanceU:0,worldsVoided:0,defensesHeld:0,missionsDone:0,maxWorldsOwned:0,battles:0,wins:0,losses:0},
      logsDaily:[], missions:[], lastSheetExport:null
    };
  }
  function load(){try{return Object.assign(def(), JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return def()}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
  function rankFor(xp){let r=RANKS[0]; for(const x of RANKS) if(xp>=x.xp) r=x; return r}
  function addXP(n, reason){
    const s=load(); s.xp+=n; const r=rankFor(s.xp); s.rankId=r.id; s.title=r.title;
    if(r.perk) s.perks[r.perk]=true;
    pushLog(s,'xp', `+${n} XP · ${reason||''} · ${s.title}`);
    checkAchievements(s); save(s); return s;
  }
  function addCredits(n, reason){
    const s=load(); const m=s.perks.double_credits?2:1; s.credits+=n*m;
    pushLog(s,'eco', `${n*m>=0?'+':''}${n*m} créditos · ${reason||''}`); save(s); return s;
  }
  function pushLog(s, kind, msg){
    const day=new Date().toISOString().slice(0,10);
    s.logsDaily.push({day, kind, msg, t:Date.now(), title:s.title, xp:s.xp});
    s.logsDaily=s.logsDaily.slice(-500);
  }
  function checkAchievements(s){
    for(const a of ACHIEVEMENTS){
      if(s.achievements[a.id]) continue;
      if(a.test(s)){
        s.achievements[a.id]={at:Date.now(), name:a.name, title:a.title, perk:a.perk};
        if(a.title) s.title=a.title+' · '+rankFor(s.xp).title;
        pushLog(s,'achieve', `LOGRO ${a.name} · perk: ${a.perk}`);
      }
    }
  }
  function bumpStat(key, n){
    const s=load(); s.stats[key]=(s.stats[key]||0)+(n||1);
    if(key==='maxWorldsOwned') s.stats.maxWorldsOwned=Math.max(s.stats.maxWorldsOwned||0, n||0);
    checkAchievements(s); save(s); return s;
  }
  function fuelMult(){const s=load(); return s.achievements.marathon?0.9:1}
  function smashDmgMult(){const s=load(); return (s.perks.smash_dmg||s.achievements.planet_killer)?1.15:1}
  function exportDayCSV(){
    const s=load();
    const day=new Date().toISOString().slice(0,10);
    const rows=[['day','kind','msg','title','xp','ts']];
    for(const e of s.logsDaily.filter(x=>x.day===day)) rows.push([e.day,e.kind,JSON.stringify(e.msg),e.title,e.xp,e.t]);
    rows.push([]);
    rows.push(['metric','value']);
    rows.push(['xp',s.xp],['credits',s.credits],['title',s.title],['rank',s.rankId]);
    Object.entries(s.stats).forEach(([k,v])=>rows.push([k,v]));
    Object.keys(s.achievements).forEach(id=>rows.push(['achievement',id]));
    const csv=rows.map(r=>r.join(',')).join('\n');
    s.lastSheetExport=Date.now(); save(s);
    return {csv, filename:`voidcrown_diario_${day}.csv`, meta:s};
  }
  function ensureMissions(){
    const s=load();
    if(s.missions && s.missions.filter(m=>!m.done).length>=3) return s;
    const pool=[
      {id:'m_orbit', name:'Puente a Marte', desc:'Lleva una flota a Marte', rewardXP:40, rewardCR:30, check:'fleet_to_mar'},
      {id:'m_hold', name:'Mantén Tierra', desc:'Termina un turno con Tierra bajo control', rewardXP:25, rewardCR:15, check:'hold_ter'},
      {id:'m_smash', name:'Herida ritual', desc:'Baja integridad SMASH bajo 50%', rewardXP:35, rewardCR:20, check:'smash_50'},
      {id:'m_assault', name:'Tomar un mundo', desc:'Gana un asalto orbital', rewardXP:50, rewardCR:40, check:'assault_win'},
      {id:'m_fuel', name:'Economía de guerra', desc:'Gasta 30 comb en despachos', rewardXP:30, rewardCR:25, check:'fuel_30'},
    ];
    const open=new Set((s.missions||[]).filter(m=>!m.done).map(m=>m.id));
    s.missions=s.missions||[];
    for(const p of pool){
      if(open.size>=3) break;
      if(open.has(p.id)) continue;
      s.missions.push({...p, done:false, progress:0});
      open.add(p.id);
    }
    save(s); return s;
  }
  global.VCMeta={load,save,addXP,addCredits,bumpStat,exportDayCSV,ensureMissions,RANKS,ACHIEVEMENTS,fuelMult,smashDmgMult,rankFor,pushLog:function(k,m){const s=load();pushLog(s,k,m);save(s)}};
})(window);
