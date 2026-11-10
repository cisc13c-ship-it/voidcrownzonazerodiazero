/**
 * VOIDCROWN · Sistema de Mando Global (spine v1)
 * Un solo estado. Eventos. RISK ↔ ÓRBITA ↔ CASTIGO ↔ Consejo.
 * EDAI: cada emit deja rastro en el Archivo Vivo de sesión.
 */
(function (G) {
  'use strict';
  const KEY = 'vc-global-command-v1';
  const META_KEY = 'vc-commander-meta-v1'; // keep compat with commander_meta.js
  const BUS = [];

  const RANKS = [
    { id: 'recluta', title: 'Recluta del Día Zero', xp: 0, badge: '◇', hud: 'gray', perk: null, ceremony: 'El Día Zero te nombra. Aún no has herido el mapa.' },
    { id: 'alferez', title: 'Alférez de la Grieta', xp: 80, badge: '◆', hud: 'cyan', perk: 'fuel_bonus', ceremony: 'La Grieta te concede insignia. −10% fuel en despachos.' },
    { id: 'capitan', title: 'Capitán de Órbitas', xp: 220, badge: '★', hud: 'gold', perk: 'assault_dice', ceremony: 'Las flotas responden a tu voz. +1 dado ofensivo en asaltos.' },
    { id: 'coronel', title: 'Coronel del Archivo', xp: 450, badge: '♛', hud: 'violet', perk: 'smash_dmg', ceremony: 'El Archivo graba tu nombre. +15% daño en CASTIGO.' },
    { id: 'estratega', title: 'Estratega Voidcrown', xp: 800, badge: '☰', hud: 'white', perk: 'enemy_delay', ceremony: 'El enemigo tarda. Sus ETA +35%.' },
    { id: 'director', title: 'Director de Caos', xp: 1300, badge: 'Ω', hud: 'red', perk: 'double_credits', ceremony: 'El Caos te obedece a medias. Créditos ×2.' },
    { id: 'viejo', title: 'Eco del Viejo', xp: 2000, badge: '∞', hud: 'ash', perk: 'legend', ceremony: 'Ya no mandas el juego. El juego te recuerda.' },
  ];

  function defState() {
    return {
      version: '72.1.0-GLOBAL-COMMAND',
      // shared economy
      xp: 0,
      credits: 500,
      title: RANKS[0].title,
      rankId: RANKS[0].id,
      badge: RANKS[0].badge,
      hudTheme: RANKS[0].hud,
      perks: {},
      achievements: {},
      // military truth (shared)
      military: {
        // world id -> {owner, garrison, ships} for orbital worlds
        worlds: {
          ter: { owner: 'player', garrison: 20, ships: 24 },
          mar: { owner: 'enemy', garrison: 10, ships: 0 },
          jup: { owner: 'enemy', garrison: 18, ships: 0 },
          sat: { owner: 'neutral', garrison: 6, ships: 0 },
          ven: { owner: 'neutral', garrison: 0, ships: 0 },
          mer: { owner: 'neutral', garrison: 0, ships: 0 },
          cer: { owner: 'neutral', garrison: 0, ships: 0 },
          plx: { owner: 'enemy', garrison: 25, ships: 0 },
        },
        fuelPool: 40,
        fleets: [],
        // RISK bridge: troop bank from orbital victories
        riskTroopBank: 0,
        lastRiskSync: null,
      },
      // castigo lab persistence (cumulative damage)
      castigo: {
        worlds: {
          lab: { crust: 100, mantle: 100, core: 100, dead: 0, chaos: 0, scars: [], bifurcated: false, history: [] },
        },
        active: 'lab',
        ammo: 12,
      },
      // director
      missions: [],
      stats: {
        assaultWins: 0, distanceU: 0, worldsVoided: 0, defensesHeld: 0,
        missionsDone: 0, maxWorldsOwned: 0, battles: 0, wins: 0, losses: 0,
        riskConquests: 0, riskAttacks: 0, fuelSpent: 0,
      },
      // archive
      events: [], // global event log
      campaigns: [],
      ceremonyQueue: [], // pending rank-up ceremonies
      lastManifest: null,
    };
  }

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!raw) {
        // migrate from commander_meta if present
        const m = JSON.parse(localStorage.getItem(META_KEY) || 'null');
        const s = defState();
        if (m) {
          s.xp = m.xp || 0; s.credits = m.credits || s.credits;
          s.stats = Object.assign(s.stats, m.stats || {});
          s.achievements = m.achievements || {};
          s.perks = m.perks || {};
          applyRank(s);
        }
        save(s);
        return s;
      }
      return Object.assign(defState(), raw, {
        military: Object.assign(defState().military, raw.military || {}),
        castigo: Object.assign(defState().castigo, raw.castigo || {}),
        stats: Object.assign(defState().stats, raw.stats || {}),
      });
    } catch (e) {
      return defState();
    }
  }

  function save(s) {
    localStorage.setItem(KEY, JSON.stringify(s));
    // mirror slim meta for old modules
    try {
      localStorage.setItem(META_KEY, JSON.stringify({
        xp: s.xp, credits: s.credits, title: s.title, rankId: s.rankId,
        perks: s.perks, achievements: s.achievements, stats: s.stats,
        missions: s.missions, logsDaily: s.events.slice(0, 200).map(e => ({
          day: (e.at || '').slice(0, 10), kind: e.type, msg: e.msg, title: s.title, xp: s.xp, t: e.ts,
        })),
      }));
    } catch (e) {}
  }

  function rankFor(xp) {
    let r = RANKS[0];
    for (const x of RANKS) if (xp >= x.xp) r = x;
    return r;
  }

  function applyRank(s) {
    const r = rankFor(s.xp);
    const prev = s.rankId;
    s.rankId = r.id; s.title = r.title; s.badge = r.badge; s.hudTheme = r.hud;
    if (r.perk) s.perks[r.perk] = true;
    if (prev && prev !== r.id) {
      s.ceremonyQueue.push({
        from: prev, to: r.id, title: r.title, badge: r.badge,
        text: r.ceremony, perk: r.perk, at: Date.now(),
      });
    }
  }

  /** Emit global event — the heart of the command system */
  function emit(type, payload) {
    const s = load();
    const ev = {
      type, payload: payload || {}, ts: Date.now(),
      at: new Date().toISOString(), turn: payload && payload.turn,
      msg: (payload && payload.msg) || type,
      xp: s.xp, title: s.title,
    };
    s.events.unshift(ev);
    s.events = s.events.slice(0, 400);

    // --- ROUTING ---
    switch (type) {
      case 'RISK_CONQUEST': {
        s.stats.riskConquests++;
        s.stats.battles++;
        s.stats.wins++;
        addXP(s, 25, 'Conquista RISK: ' + (payload.territory || ''));
        addCredits(s, 15, 'botín territorial');
        // orbital bridge: conquest freezes +2 ships on Terra bank
        s.military.riskTroopBank = (s.military.riskTroopBank || 0) + 2;
        s.military.worlds.ter.ships = (s.military.worlds.ter.ships || 0) + 1;
        break;
      }
      case 'RISK_ATTACK': {
        s.stats.riskAttacks++;
        s.stats.battles++;
        if (payload.won) { s.stats.wins++; addXP(s, 8, 'Ataque RISK'); }
        else { s.stats.losses++; addXP(s, 2, 'Baja RISK'); }
        break;
      }
      case 'RISK_VICTORY': {
        addXP(s, 100, 'Victoria Día Zero');
        addCredits(s, 80, 'cierre de campaña RISK');
        s.stats.wins++;
        break;
      }
      case 'FLEET_LAUNCH': {
        s.stats.fuelSpent = (s.stats.fuelSpent || 0) + (payload.fuel || 0);
        s.military.fuelPool = Math.max(0, (s.military.fuelPool || 0) - (payload.fuel || 0));
        if (payload.from && s.military.worlds[payload.from]) {
          s.military.worlds[payload.from].ships = Math.max(0, (s.military.worlds[payload.from].ships || 0) - (payload.ships || 0));
        }
        addXP(s, 3, 'Despacho orbital');
        break;
      }
      case 'FLEET_ARRIVE_REINFORCE': {
        if (payload.to && s.military.worlds[payload.to]) {
          s.military.worlds[payload.to].ships = (s.military.worlds[payload.to].ships || 0) + (payload.ships || 0);
          s.military.worlds[payload.to].garrison = (s.military.worlds[payload.to].garrison || 0) + (payload.ships || 0);
          s.military.worlds[payload.to].owner = 'player';
        }
        s.stats.distanceU += payload.units || 0;
        addXP(s, 10, 'Refuerzo orbital');
        // RISK bridge: reinforce → troop bank
        s.military.riskTroopBank = (s.military.riskTroopBank || 0) + Math.ceil((payload.ships || 0) / 4);
        break;
      }
      case 'FLEET_ARRIVE_ASSAULT_WIN': {
        if (payload.to && s.military.worlds[payload.to]) {
          s.military.worlds[payload.to].owner = 'player';
          s.military.worlds[payload.to].garrison = payload.remain || 1;
          s.military.worlds[payload.to].ships = payload.remain || 1;
        }
        s.stats.assaultWins++;
        s.stats.distanceU += payload.units || 0;
        s.stats.wins++;
        addXP(s, 40, 'Asalto orbital ganado');
        addCredits(s, 25, 'mundo tomado');
        s.military.riskTroopBank = (s.military.riskTroopBank || 0) + 3;
        completeMission(s, 'assault_win');
        break;
      }
      case 'FLEET_ARRIVE_ASSAULT_LOSE': {
        s.stats.losses++;
        addXP(s, 5, 'Asalto fallido');
        break;
      }
      case 'DEFENSE_HELD': {
        s.stats.defensesHeld++;
        addXP(s, 20, 'Muro de Hierro: defensa');
        break;
      }
      case 'WORLD_LOST': {
        if (payload.id && s.military.worlds[payload.id]) {
          s.military.worlds[payload.id].owner = 'enemy';
          s.military.worlds[payload.id].ships = 0;
        }
        s.stats.losses++;
        break;
      }
      case 'CASTIGO_IMPACT': {
        const w = s.castigo.worlds[s.castigo.active] || s.castigo.worlds.lab;
        const dmg = payload.dmg || 0;
        // cumulative layers
        let left = dmg * (s.perks.smash_dmg ? 1.15 : 1);
        const eat = (k) => { const t = Math.min(w[k], left); w[k] = Math.max(0, +(w[k] - t).toFixed(2)); left -= t; };
        eat('crust'); if (left > 0) eat('mantle'); if (left > 0) eat('core');
        w.dead = (w.dead || 0) + Math.floor(dmg * 90000);
        w.chaos = (w.chaos || 0) + Math.ceil(dmg / 3);
        w.history.push({ t: Date.now(), weapon: payload.weapon, dmg, crust: w.crust, mantle: w.mantle, core: w.core });
        w.history = w.history.slice(-80);
        if (payload.scar) w.scars.push(payload.scar);
        if (payload.bifurcate) w.bifurcated = true;
        s.castigo.worlds[s.castigo.active] = w;
        addXP(s, Math.max(1, Math.floor(dmg / 5)), 'Impacto ' + (payload.weapon || ''));
        if (w.crust + w.mantle + w.core < 50) completeMission(s, 'smash_50');
        if (w.crust <= 0 && w.mantle <= 0 && w.core <= 0) {
          s.stats.worldsVoided++;
          addXP(s, 60, 'Mundo VOID');
          addCredits(s, 50, 'Castigo total');
          emit_internal(s, 'CASTIGO_VOID', { world: s.castigo.active });
        }
        break;
      }
      case 'CASTIGO_VOID': {
        // already handled xp in impact
        break;
      }
      case 'TURN_END': {
        s.military.fuelPool = (s.military.fuelPool || 0) + 4;
        break;
      }
      case 'MISSION_COMPLETE': {
        s.stats.missionsDone++;
        break;
      }
      case 'SYNC_RISK_BANK': {
        // consume troop bank into RISK reinforce phase
        const n = s.military.riskTroopBank || 0;
        s.military.riskTroopBank = 0;
        s.military.lastRiskSync = Date.now();
        payload.resolved = n;
        ev.payload.resolved = n;
        break;
      }
      default:
        break;
    }

    // owned worlds stat
    const owned = Object.values(s.military.worlds).filter(w => w.owner === 'player').length;
    s.stats.maxWorldsOwned = Math.max(s.stats.maxWorldsOwned || 0, owned);

    applyRank(s);
    checkAchievements(s);
    save(s);
    // notify listeners
    BUS.forEach(fn => { try { fn(ev, s); } catch (e) {} });
    return { event: ev, state: s };
  }

  function emit_internal(s, type, payload) {
    s.events.unshift({ type, payload, ts: Date.now(), at: new Date().toISOString(), msg: type });
  }

  function addXP(s, n, reason) {
    s.xp += n;
    s.events.unshift({ type: 'XP', payload: { n, reason }, ts: Date.now(), at: new Date().toISOString(), msg: `+${n} XP · ${reason}`, xp: s.xp, title: s.title });
  }
  function addCredits(s, n, reason) {
    const m = s.perks.double_credits ? 2 : 1;
    s.credits += n * m;
  }

  function completeMission(s, check) {
    (s.missions || []).forEach(m => {
      if (!m.done && m.check === check) {
        m.done = true;
        addXP(s, m.rewardXP || 20, m.name);
        addCredits(s, m.rewardCR || 10, m.name);
        s.stats.missionsDone++;
        s.events.unshift({ type: 'MISSION_COMPLETE', msg: m.name, ts: Date.now(), at: new Date().toISOString() });
      }
    });
  }

  const ACH = [
    { id: 'first_blood', name: 'Primera sangre orbital', test: s => s.stats.assaultWins >= 1, perk: 'capture_garrison', title: 'Rompe-mundos' },
    { id: 'marathon', name: 'Maratón de rutas', test: s => s.stats.distanceU >= 100, perk: 'fuel_bonus', title: 'Peregrino de AU' },
    { id: 'planet_killer', name: 'Mataplanetas', test: s => s.stats.worldsVoided >= 1, perk: 'smash_dmg', title: 'Dedo de Dios' },
    { id: 'iron_wall', name: 'Muro de hierro', test: s => s.stats.defensesHeld >= 3, perk: 'terra_ships', title: 'Baluarte' },
    { id: 'cartographer', name: 'Cartógrafo vivo', test: s => s.stats.maxWorldsOwned >= 5, perk: 'tactical_boost', title: 'Señor del Sistema' },
    { id: 'risk_warlord', name: 'Señor de 42', test: s => s.stats.riskConquests >= 5, perk: 'risk_income', title: 'Corona del Mapa' },
    { id: 'jojo_stand', name: 'Stand del Comandante', test: s => s.xp >= 220, perk: 'menacing_hud', title: '★ Menacing' },
  ];

  function checkAchievements(s) {
    ACH.forEach(a => {
      if (s.achievements[a.id]) return;
      if (a.test(s)) {
        s.achievements[a.id] = { at: Date.now(), name: a.name, title: a.title, perk: a.perk };
        if (a.perk) s.perks[a.perk] = true;
        if (a.title) s.title = a.title + ' · ' + rankFor(s.xp).title;
      }
    });
  }

  function ensureMissions() {
    const s = load();
    const pool = [
      { id: 'm_orbit', name: 'Puente a Marte', desc: 'Lleva flota a Marte', rewardXP: 40, rewardCR: 30, check: 'fleet_to_mar' },
      { id: 'm_hold', name: 'Mantén Tierra', desc: 'Tierra bajo control al fin de turno', rewardXP: 25, rewardCR: 15, check: 'hold_ter' },
      { id: 'm_smash', name: 'Herida ritual', desc: 'Integridad CASTIGO < 50', rewardXP: 35, rewardCR: 20, check: 'smash_50' },
      { id: 'm_assault', name: 'Tomar un mundo', desc: 'Gana un asalto orbital', rewardXP: 50, rewardCR: 40, check: 'assault_win' },
      { id: 'm_risk', name: 'Cinco heridas', desc: '5 conquistas RISK', rewardXP: 60, rewardCR: 40, check: 'risk_5' },
    ];
    s.missions = s.missions || [];
    const open = s.missions.filter(m => !m.done).length;
    if (open < 3) {
      pool.forEach(p => {
        if (s.missions.filter(m => !m.done).length >= 3) return;
        if (!s.missions.some(m => m.id === p.id && !m.done)) s.missions.push({ ...p, done: false });
      });
    }
    // auto complete risk_5
    if (s.stats.riskConquests >= 5) completeMission(s, 'risk_5');
    save(s);
    return s;
  }

  function popCeremony() {
    const s = load();
    const c = (s.ceremonyQueue || []).shift();
    save(s);
    return c || null;
  }

  function on(fn) { BUS.push(fn); return () => { const i = BUS.indexOf(fn); if (i >= 0) BUS.splice(i, 1); }; }

  function fuelMult(s) {
    s = s || load();
    return (s.perks.fuel_bonus || s.achievements.marathon) ? 0.9 : 1;
  }

  function troopBank() {
    return load().military.riskTroopBank || 0;
  }

  function consumeTroopBank() {
    return emit('SYNC_RISK_BANK', { msg: 'Sincronizar tropas Órbita→RISK' }).event.payload.resolved || 0;
  }

  function exportDayCSV() {
    const s = load();
    const day = new Date().toISOString().slice(0, 10);
    const rows = [['day', 'type', 'msg', 'title', 'xp', 'ts']];
    s.events.filter(e => (e.at || '').slice(0, 10) === day).forEach(e => {
      rows.push([day, e.type, JSON.stringify(e.msg), s.title, s.xp, e.ts]);
    });
    rows.push([]);
    rows.push(['metric', 'value']);
    Object.entries(s.stats).forEach(([k, v]) => rows.push([k, v]));
    rows.push(['xp', s.xp], ['credits', s.credits], ['rank', s.rankId], ['troop_bank', s.military.riskTroopBank]);
    return { csv: rows.map(r => r.join(',')).join('\n'), filename: `voidcrown_global_${day}.csv`, state: s };
  }

  function writeManifest(info) {
    const s = load();
    s.lastManifest = Object.assign({ at: new Date().toISOString() }, info || {});
    save(s);
    return s.lastManifest;
  }

  // public API
  G.VCGlobal = {
    load, save, emit, on, RANKS, ACH, ensureMissions, popCeremony,
    fuelMult, troopBank, consumeTroopBank, exportDayCSV, writeManifest,
    rankFor, KEY, version: '72.1.0-GLOBAL-COMMAND',
  };

  // bootstrap
  try { ensureMissions(); writeManifest({ change: 'spine-load', deps: ['localStorage'], tests: 'manual', rollback: 'clear ' + KEY }); } catch (e) {}
})(window);
