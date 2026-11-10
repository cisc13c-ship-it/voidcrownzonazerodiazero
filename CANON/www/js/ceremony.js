(function(G){
  function ensureStyle(){
    if(document.getElementById('vc-cer-style')) return;
    const s=document.createElement('style'); s.id='vc-cer-style';
    s.textContent=`
    #vcCeremony{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;
      background:rgba(0,0,0,.88);padding:20px;font-family:system-ui,sans-serif}
    #vcCeremony.on{display:flex}
    #vcCeremony .box{max-width:420px;width:100%;background:linear-gradient(160deg,#1a1028,#0a0e16);
      border:1px solid rgba(255,200,87,.45);border-radius:18px;padding:22px;text-align:center;color:#eef1ff;
      box-shadow:0 0 60px rgba(255,200,87,.15)}
    #vcCeremony .badge{font-size:48px;line-height:1;margin-bottom:8px;filter:drop-shadow(0 0 12px #ffc857)}
    #vcCeremony h2{font-size:12px;letter-spacing:.28em;color:#ffc857;margin:0 0 8px}
    #vcCeremony h1{font-size:22px;margin:0 0 12px}
    #vcCeremony p{font-size:13px;color:#aab;line-height:1.45;margin:0 0 16px}
    #vcCeremony button{min-height:44px;padding:10px 18px;border-radius:12px;border:0;font-weight:800;
      background:linear-gradient(180deg,#c9a227,#7a5a10);color:#1a1000;cursor:pointer}
    #vcHudChip{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:50;
      background:rgba(0,0,0,.72);border:1px solid rgba(255,200,87,.35);border-radius:999px;
      padding:6px 12px;font-size:11px;color:#ffc857;font-weight:700;pointer-events:none;
      font-family:system-ui,sans-serif;letter-spacing:.04em;max-width:92vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    `;
    document.head.appendChild(s);
  }
  function showCeremony(c){
    if(!c) return;
    ensureStyle();
    let el=document.getElementById('vcCeremony');
    if(!el){ el=document.createElement('div'); el.id='vcCeremony'; document.body.appendChild(el); }
    el.className='on';
    el.innerHTML=`<div class="box"><div class="badge">${c.badge||'★'}</div>
      <h2>ASCENSO DE RANGO</h2><h1>${c.title}</h1>
      <p>${c.text||''}${c.perk?' · perk: '+c.perk:''}</p>
      <button type="button" id="vcCerOk">Aceptar mando</button></div>`;
    el.querySelector('#vcCerOk').onclick=()=>el.classList.remove('on');
  }
  function pollCeremony(){
    if(!G.VCGlobal) return;
    const c=G.VCGlobal.popCeremony();
    if(c) showCeremony(c);
  }
  function paintChip(){
    if(!G.VCGlobal) return;
    ensureStyle();
    const s=G.VCGlobal.load();
    let chip=document.getElementById('vcHudChip');
    if(!chip){ chip=document.createElement('div'); chip.id='vcHudChip'; document.body.appendChild(chip); }
    chip.textContent=`${s.badge} ${s.title} · ${s.xp} XP · ${s.credits} cr · bank ${s.military.riskTroopBank||0}`;
  }
  function boot(){
    paintChip(); pollCeremony();
    setInterval(()=>{paintChip(); pollCeremony();}, 2000);
  }
  G.VCCeremony={showCeremony,pollCeremony,paintChip,boot};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
