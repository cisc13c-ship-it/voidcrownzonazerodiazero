(function (G) {
  'use strict';
  const KEY = 'vc-marcos-12-5-v1';
  const LAYERS = {
    mundo: { id: 'mundo', name: 'Mundo', blurb: 'HTML · Three offline · teatro abierto' },
    estrato: { id: 'estrato', name: 'Estrato', blurb: 'Risk Zero Dice · teatro · suelo · VMira · grieta' },
    legion: { id: 'legion', name: 'Legión', blurb: 'Autopilot: sin control visible → no actúa' },
    marcos: { id: 'marcos', name: 'Marcos', blurb: 'Tres escalas del mismo suceso' },
  };
  const SCALES = [
    { id: 'cuerpo', name: 'Cuerpo', desc: 'El mapa / el planeta tocable' },
    { id: 'herida', name: 'Herida', desc: 'Combate, flota, castigo — el golpe' },
    { id: 'archivo', name: 'Archivo', desc: 'Memoria, XP, diary, el Viejo' },
  ];
  function def() {
    return {
      origin: '12.5.0-BRUTAL', continuity: true, turn: 1,
      theater: 'dia-zero', suelo: 'tierra-grieta',
      vmira: { active: true, zoom: 1, focus: null },
      grieta: { open: false, depth: 0 },
      legionAutopilot: true, controlVisible: true, scale: 'cuerpo', events: [],
    };
  }
  function load() { try { return Object.assign(def(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return def(); } }
  function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); }
  function legionMayAct() { const s = load(); return !!(s.legionAutopilot && s.controlVisible); }
  function setControlVisible(v) { const s = load(); s.controlVisible = !!v; save(s); return s.controlVisible; }
  function setScale(id) { const s = load(); if (SCALES.some(x => x.id === id)) s.scale = id; save(s); return s.scale; }
  function onTurn(n) {
    const s = load(); s.turn = n || s.turn; save(s);
    try { if (G.VCGlobal) G.VCGlobal.diary('Turno ' + s.turn + ' · 12.5 escala ' + s.scale); } catch (e) {}
    return s;
  }
  function openGrieta(depth) {
    const s = load(); s.grieta = { open: true, depth: depth || (s.grieta.depth || 0) + 1 }; save(s); return s.grieta;
  }
  function sameEventThreeScales(label) {
    return SCALES.map(sc => ({ scale: sc.id, name: sc.name, reading: sc.desc + ' · ' + (label || 'suceso') }));
  }
  G.VCMarcos = { LAYERS, SCALES, load, save, legionMayAct, setControlVisible, setScale, onTurn, openGrieta, sameEventThreeScales, version: '12.5.0-BRUTAL→73.1' };
})(window);
