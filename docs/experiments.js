(function(root){
 'use strict';
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let cleanup=()=>{};
 function cancel(){cleanup();cleanup=()=>{};}
 function mountBoot(host,{record=null,passed=false,name,onRun}){
  cancel();let step=0;
  const draw=()=>{
   const identity=record&&record.name===name,online=record?.online===true;
   const halt=!!record&&((step>=1&&!identity)||(step>=2&&!online));
   const ready=!!record&&passed&&step===3;
   const status=!record?'OFFLINE':halt?'BOOT PAUSED':ready?'ONLINE':step===0?'PATCH LOADED':step===1?'IDENTITY FOUND':'INITIALIZED';
   const stages=['Load your boot function','Read the machine identity','Check the online flag','Hand off to your OS'];
   const lines=!record?['[machine] browser runtime available','[boot] no initialization has run','[next] power on to execute your Python patch']:['[load] your Python function returned a record',...(step>=1?[identity?'[identity] '+record.name:'[identity] expected '+name+', got '+String(record?.name)]:[]),...(step>=2&&!(!identity)?['[online] '+String(record.online),online?'[initialize] system marked ready':'[halt] initialization has not succeeded']:[]),...(ready?['[ready] '+name+' is online','[next] create your first process in Task 01']:[])];
   host.innerHTML=`<div class="boot-console ${ready?'online':''}"><div class="boot-console-head"><span>BOOT CONSOLE / ${escape(name)}</span><strong id="boot-state">${status}</strong></div><div class="boot-body"><div class="boot-checklist">${stages.map((s,i)=>`<div class="boot-check ${record&&i<=step?'reached':''}"><span>${record&&i<step?'✓':String(i+1).padStart(2,'0')}</span>${s}</div>`).join('')}</div><div class="boot-screen"><pre>${escape(lines.join('\n'))}</pre>${ready?`<div class="boot-prompt">${escape(name)}:boot$ <span class="terminal-cursor" aria-hidden="true">▌</span></div>`:''}</div></div><div class="scene-controls"><button id="power-on" class="${!record?'primary':''}">${record?'Run current patch again':'Power on with my patch'}</button><button id="boot-step" ${!record||halt||step===3?'disabled':''}>Next boot step</button><button id="boot-replay" ${!record?'disabled':''}>Replay boot</button></div><p class="scene-note">This initializes a software machine. Processes, files and a command shell are still to come.</p><div class="tutor-nudge">Predict with your tutor: what should the console do if initialization does not succeed?</div></div>`;
   host.querySelector('#power-on').onclick=onRun;
   host.querySelector('#boot-step').onclick=()=>{step=Math.min(3,step+1);draw();host.querySelector('#boot-step').focus();};
   host.querySelector('#boot-replay').onclick=()=>{step=0;draw();host.querySelector('#boot-step').focus();};
  };draw();
 }
 function ioFrames(state,latency){
  const blocked=state==='BLOCKED';const frames=[];
  for(let t=0;t<=latency;t++)frames.push({time:t,latency,blocked,useful:blocked?t:0,polls:blocked?0:t,progress:t/latency,ready:t===latency,cpu:t===0?'No tick yet':blocked?'Music: useful work':'Editor: checking for data',editor:blocked?'BLOCKED':'RUNNING'});
  return frames;
 }
 function mountIO(host,{record=null,onRun}){
  cancel();let latency=4,index=0,timer=null,comparison=false;
  const stop=()=>{clearInterval(timer);timer=null;};cleanup=stop;
  const draw=()=>{
   const state=comparison?'RUNNING':record?.state;
   const valid=state==='BLOCKED'||state==='RUNNING';
   const f=ioFrames(state,latency)[index];
   const ready=!!record&&valid&&f.ready;
   host.innerHTML=`<div class="io-console"><div class="boot-console-head"><span>CPU &amp; DEVICE / TWO SEPARATE JOBS</span><strong>${!record?'AWAITING YOUR HANDLER':!valid?'CHECK RETURNED STATE':ready?'DATA READY':'WAITING FOR DATA'}</strong></div><p>Editor needs file data before it can calculate. The device takes time; a CPU turn cannot make the data arrive sooner.</p><div class="io-settings"><label for="io-latency">Device delay <input id="io-latency" type="range" min="2" max="6" value="${latency}"> <span>${latency} ticks</span></label>${record?`<label><input id="io-compare" type="checkbox" ${comparison?'checked':''}> Compare: keep Editor polling on the CPU</label>`:''}</div><div class="io-lanes"><section class="io-lane"><h3>CPU lane</h3><strong id="io-cpu">${!record?'No handler result yet':!valid?'Unsupported state: '+escape(state):escape(f.cpu)}</strong><div class="io-counters"><span>Useful work <b id="io-useful">${record&&valid?f.useful:0}</b></span><span>Polling turns <b id="io-polls">${record&&valid?f.polls:0}</b></span></div><div class="mini-ticks">${Array.from({length:latency},(_,i)=>`<span class="${record&&valid&&i<index?'filled':''}">${record&&valid&&i<index?(f.blocked?'M':'?'):'·'}</span>`).join('')}</div></section><section class="io-lane"><h3>File-device lane</h3><strong>${ready?'Data has arrived':!record?'Request not submitted':'Transfer in progress'}</strong><div class="transfer-track" role="progressbar" aria-label="File data transfer" aria-valuemin="0" aria-valuemax="${latency}" aria-valuenow="${record&&valid?index:0}">${Array.from({length:latency},(_,i)=>`<span class="${record&&valid&&i<index?'filled':''}">${i+1}</span>`).join('')}</div><p>The same ${latency}-tick delay in both policies.</p></section></div><div class="io-process"><span>Editor state: <b>${record?escape(state):'RUNNING before request'}</b></span><span>Editor memory: <b>retained</b></span><span>Elapsed: <b id="io-time">${index} / ${latency}</b></span></div><div class="scene-controls"><button id="io-run">${record?'Run current handler again':'Send file request with my handler'}</button><button id="io-play" ${!record||!valid||ready?'disabled':''}>${timer?'Pause':'Play'}</button><button id="io-step" ${!record||!valid||ready?'disabled':''}>Step +1 tick</button><button id="io-replay" ${!record?'disabled':''}>Replay</button></div><p id="io-explanation" class="scene-note">${!record?'Execute your Python handler, then predict who should use the CPU while data travels.':!valid?'Return a valid process state before running this comparison.':ready&&f.blocked?'The file is ready, but Editor is still BLOCKED. Task 07 will deliver the completion event and wake it.':ready?'The device finished at the same time. CPU turns spent repeatedly checking the file did no useful computation.':f.blocked?'Your handler removed Editor from the runnable set. Music can compute while the device works.':'Polling reference: Editor keeps this CPU and repeatedly checks for data. Its state alone has not made the data arrive.'}</p><div class="tutor-nudge">Pause with your tutor: which lane changed when you blocked Editor? Which lane did not?</div></div>`;
   host.querySelector('#io-run').onclick=onRun;
   host.querySelector('#io-latency').oninput=e=>{const value=Number(e.target.value);stop();latency=value;index=0;draw();host.querySelector('#io-latency').focus();};
   if(record)host.querySelector('#io-compare').onchange=e=>{comparison=e.target.checked;stop();index=0;draw();host.querySelector('#io-compare').focus();};
   host.querySelector('#io-play').onclick=()=>{if(timer){stop();draw();return;}timer=setInterval(()=>{if(!host.isConnected){stop();return;}index=Math.min(latency,index+1);if(index===latency)stop();draw();},500);draw();};
   host.querySelector('#io-step').onclick=()=>{stop();index=Math.min(latency,index+1);draw();host.querySelector('#io-step').focus();};
   host.querySelector('#io-replay').onclick=()=>{stop();index=0;draw();host.querySelector('#io-play').focus();};
  };draw();
 }
 const api={cancel,mountBoot,mountIO,ioFrames};root.WorkshopFX=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
