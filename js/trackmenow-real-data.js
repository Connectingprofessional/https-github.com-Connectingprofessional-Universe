(function(){
'use strict';
const C=window.TrackMeNowConfig||{};
const apiBase=String(C.apiBase||window.TMN_API_BASE||'').replace(/\/$/,'');
function api(path){return (apiBase||'')+path}
function ensure(){
  if(document.getElementById('tm-argos-hud'))return;
  const hud=document.createElement('div');hud.id='tm-argos-hud';hud.className='tm-argos-hud';
  hud.innerHTML='<div class="tm-argos-brand">TRACK<span>ME</span>NOW <b>/// LIVE ATLAS</b></div>';
  document.body.appendChild(hud);
  const status=document.createElement('div');status.id='tm-argos-status';status.className='tm-argos-status';
  status.innerHTML='<i class="tm-argos-dot"></i><span>REAL DATA: CHECKING</span>';
  document.body.appendChild(status);
  const rail=document.createElement('nav');rail.className='tm-argos-rail';
  rail.innerHTML='<button data-layer="flights" title="Flights">✈</button><button data-layer="ships" title="Ships">⚓</button><button data-layer="public-transport" title="Transit">▣</button><button data-layer="cameras" title="Cameras">◉</button><button data-layer="infrastructure" title="Infrastructure">⌂</button>';
  document.body.appendChild(rail);
  const src=document.createElement('div');src.id='tm-argos-source';src.className='tm-argos-source';src.textContent='Source status: waiting for map bounds';
  document.body.appendChild(src);
  rail.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;rail.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');window.TrackMeNowRealData&&window.TrackMeNowRealData.setLayer(b.dataset.layer);});
}
function bounds(){
  const m=window.map;if(!m||!m.getBounds)return null;const b=m.getBounds();
  return [b.getWest(),b.getSouth(),b.getEast(),b.getNorth()].join(',');
}
let timer=0;
async function refresh(){
  ensure();
  const status=document.getElementById('tm-argos-status'),src=document.getElementById('tm-argos-source'),dot=status&&status.querySelector('.tm-argos-dot');
  if(!window.map||!bounds()){return}
  const layers=window.TrackMeNowRealData?.layers?.join(',')||'flights,ships,public-transport,cameras,infrastructure';
  try{
    const r=await fetch(api('/api/movement?bbox='+encodeURIComponent(bounds())+'&zoom='+encodeURIComponent(window.map.getZoom())+'&layers='+encodeURIComponent(layers)),{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const j=await r.json();
    if(dot)dot.className='tm-argos-dot live';
    if(status)status.querySelector('span').textContent='REAL DATA: LIVE';
    const ss=(j.sources||[]).map(x=>x.layer+':'+x.status+(x.count!=null?' '+x.count:'' )).join(' · ');
    if(src)src.textContent=ss||'Real source returned no features for this viewport';
    window.dispatchEvent(new CustomEvent('trackmenow:real-data',{detail:j}));
  }catch(e){
    if(dot)dot.className='tm-argos-dot error';
    if(status)status.querySelector('span').textContent='REAL DATA: OFFLINE';
    if(src)src.textContent=apiBase?'Backend unavailable: '+e.message:'Backend URL not configured for GitHub Pages';
  }
}
window.TrackMeNowRealData={
  layers:['flights','ships','public-transport','cameras','infrastructure'],
  setLayer:function(x){this.layers=[x];refresh();},
  refresh:refresh
};
document.addEventListener('DOMContentLoaded',ensure);
window.addEventListener('load',function(){setTimeout(refresh,1500);if(window.map){window.map.on('moveend',()=>{clearTimeout(timer);timer=setTimeout(refresh,700);});}});
})();