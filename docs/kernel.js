(function(root){
'use strict';
function pythonWorkerMain(){
 onmessage=async(event)=>{
  try{
   const {source,fn,calls}=event.data;
   Sk.configure({__future__:Sk.python3,output:()=>{},read:path=>{if(Sk.builtinFiles?.files[path]!==undefined)return Sk.builtinFiles.files[path];throw Error('Module not available: '+path);},execLimit:1000});
   const mod=await Sk.misceval.asyncToPromise(()=>Sk.importMainWithBody('student',false,source,true));
   const invoke=(name,args)=>{const f=mod.$d[name];if(!f)throw Error('Define '+name+' with def '+name+'(...):');return Sk.ffi.remapToJs(Sk.misceval.callsimArray(f,args.map(a=>Sk.ffi.remapToPy(a))));};
   let results;
   if(fn==='__schedule__'){
    const choose_next=queue=>invoke('choose_next',[queue]),time_slice=remaining=>invoke('time_slice',[remaining]);
    const schedule=new Function('choose_next','time_slice','return ('+event.data.scheduleSource+');')(choose_next,time_slice);
    results=[schedule(calls[0][0])];
   }else{results=calls.map(args=>invoke(fn,args));}
   postMessage({ok:true,results});
  }catch(e){postMessage({ok:false,error:typeof e.toString==='function'?e.toString():String(e)});}
 };
}
function execute(source,fn,calls){
 return new Promise((resolve,reject)=>{
  const workerText=PYTHON_RUNTIME_SOURCE+';\n('+pythonWorkerMain.toString()+')();';
  const url=URL.createObjectURL(new Blob([workerText],{type:'text/javascript'}));
  let worker,timer;const cleanup=()=>{clearTimeout(timer);worker?.terminate();URL.revokeObjectURL(url);};
  try{worker=new Worker(url);timer=setTimeout(()=>{cleanup();reject(Error('Python execution exceeded 3000 ms. Check for an infinite loop, then try again.'));},3000);
   worker.onmessage=e=>{cleanup();e.data.ok?resolve(e.data.results):reject(Error(e.data.error));};
   worker.onerror=e=>{e.preventDefault();cleanup();reject(Error(e.message||'Code could not run.'));};
   worker.postMessage({source,fn,calls,scheduleSource:fn==='__schedule__'?schedule_experiment.toString():null});
  }catch(e){cleanup();reject(e);}
 });
}
// Serialized into the worker with the learner's functions, so policies actually execute.
function schedule_experiment(policy){
 const jobs=[{id:'V',name:'Video Export',remaining:12,burst:12},{id:'M',name:'Music Player',remaining:6,burst:6},{id:'C',name:'Chat Message',remaining:4,burst:4}].map(p=>({...p,wait:0,first:null}));
 let queue=jobs.map(p=>p.id),active=null,left=0,last=null,switches=0;const frames=[],timeline=[];
 const snapshot=t=>({time:t,queue:[...queue],active,switches,timeline:[...timeline],jobs:jobs.map(p=>({...p})),waiting:jobs.reduce((n,p)=>n+p.wait,0)/3,response:jobs.every(p=>p.first!==null)?jobs.reduce((n,p)=>n+p.first,0)/3:null});
 frames.push(snapshot(0));
 for(let t=0;t<22;t++){
  if(!active){const selected=choose_next(queue.map(id=>({...jobs.find(p=>p.id===id)})));if(!selected||!queue.includes(selected.id))throw Error('Scheduler must return a process from the current ready queue.');active=selected.id;queue=queue.filter(id=>id!==active);const p=jobs.find(p=>p.id===active);left=policy==='rr'?time_slice(p.remaining):p.remaining;if(!Number.isInteger(left)||left<1||left>p.remaining)throw Error('Invalid time slice.');if(last!==null&&last!==active)switches++;last=active;}
  const p=jobs.find(p=>p.id===active);if(p.first===null)p.first=t;queue.forEach(id=>jobs.find(p=>p.id===id).wait++);p.remaining--;left--;timeline.push(active);
  if(p.remaining===0){p.finish=t+1;active=null;}else if(left===0){queue.push(active);active=null;}
  frames.push(snapshot(t+1));
 }
 return frames;
}
async function schedule(source,policy,quantumSource='def time_slice(remaining):\n    return min(2, remaining)'){
 return (await execute(source+'\n\n'+quantumSource,'__schedule__',[[policy]]))[0];
}
class Kernel{
 constructor(name,program,runner){this.name=name;this.program=program;this.runner=runner;this.clock=0;this.nextPid=1;this.processes=[];this.ready=[];this.active=null;this.left=0;this.last=null;this.switches=0;this.capacity=32;this.files={};this.directories=new Set(['/','/home','/home/student','/home/student/projects']);this.cwd='/home/student';this.locks={};this.policy='rr';this.online=false;this.events=[];}
 async call(id,fn,...args){return (await this.runner(this.program[id],fn,[args]))[0];}
 async boot(){const record=await this.call(0,'boot',this.name);if(!record||record.online!==true||record.name!==this.name)throw Error('Boot contract failed.');this.online=true;this.files=await this.call(10,'write_file',{},'/home/student/welcome.txt',`Welcome to ${this.name}. You built the rules that run this machine.`);return [`[boot] ${record.name} online`,`[kernel] 1 core · 32 memory units · round robin`,`[ready] Python modules loaded. Type help and press Enter.`,`[start] Try pwd, ls, cat welcome.txt, then cd projects.`];}
 free(){return this.capacity-this.processes.filter(p=>p.state!=='DONE').reduce((s,p)=>s+p.memory,0);}
 async spawn(name,ticks,io=false){if(!/^[\w.-]{1,30}$/.test(name)||!Number.isInteger(ticks)||ticks<1||ticks>50)throw Error('Use run <name> <ticks 1..50> [io].');if(this.processes.filter(p=>p.state!=='DONE').length>=20)throw Error('Process limit reached.');const reserved=await this.call(2,'allocate',this.free(),8);if(reserved!==8)throw Error('Not enough memory: each process reserves 8 units. Finish or kill a process.');const record=await this.call(1,'create_process',name,ticks);if(record?.state!=='READY'||record.remaining!==ticks||record.name!==name)throw Error('Process contract failed.');const p={...record,pid:this.nextPid++,id:this.nextPid-1,burst:ticks,memory:8,arrival:this.clock,first:null,wait:0,executed:0,io,ioUsed:false,wake:null};this.processes.push(p);this.ready.push(p.pid);return p;}
 finish(p){p.state='DONE';p.finished=this.clock;this.ready=this.ready.filter(id=>id!==p.pid);if(this.active===p.pid)this.active=null;for(const key of Object.keys(this.locks))if(this.locks[key]===p.pid)delete this.locks[key];}
 async tick(){const log=[];
  for(const p of this.processes.filter(p=>p.state==='BLOCKED'&&p.wake<=this.clock)){const record=await this.call(7,'on_interrupt',{...p});if(record.state!=='READY')throw Error('Interrupt must return READY.');p.state=record.state;p.wake=null;this.ready.push(p.pid);log.push(`t=${this.clock} IRQ: ${p.name} → READY`);}
  if(this.active===null&&this.ready.length){const items=this.ready.map(id=>({...this.processes.find(p=>p.pid===id)}));const chosen=await this.call(this.policy==='sjf'?4:3,'choose_next',items);if(!chosen||!this.ready.includes(chosen.pid))throw Error('Invalid scheduler result.');const p=this.processes.find(p=>p.pid===chosen.pid);this.active=p.pid;this.ready=this.ready.filter(id=>id!==p.pid);this.left=this.policy==='rr'?await this.call(5,'time_slice',p.remaining):p.remaining;if(!Number.isInteger(this.left)||this.left<1||this.left>p.remaining)throw Error('Invalid time slice.');if(this.last!==null&&this.last!==p.pid)this.switches++;this.last=p.pid;p.state='RUNNING';if(p.first===null)p.first=this.clock;}
  if(this.active===null){log.push(`t=${this.clock} CPU idle`);this.clock++;return log;}
  const p=this.processes.find(p=>p.pid===this.active);for(const id of this.ready)this.processes.find(p=>p.pid===id).wait++;
  log.push(`t=${this.clock} CPU → ${p.name} (${p.remaining-1} left)`);p.remaining--;p.executed++;this.left--;this.clock++;
  if(p.remaining===0){this.finish(p);log.push(`t=${this.clock} ${p.name} DONE · 8 memory units released`);}
  else if(p.io&&!p.ioUsed){const record=await this.call(6,'on_io',{...p});if(record.state!=='BLOCKED')throw Error('I/O must return BLOCKED.');p.state=record.state;p.ioUsed=true;p.wake=this.clock+2;this.active=null;log.push(`t=${this.clock} ${p.name} BLOCKED · I/O completes at t=${p.wake}`);}
  else if(this.left===0){p.state='READY';this.ready.push(p.pid);this.active=null;}
  this.events.push(...log);this.events=this.events.slice(-100);return log;
 }
 async command(line){if(!this.online)throw Error('System is offline.');if(!line.trim())return [];if(line.length>300)throw Error('Command too long (300 characters max).');const tokens=await this.call(11,'parse_command',line);if(!Array.isArray(tokens)||tokens.some(t=>typeof t!=='string'))throw Error('Shell must return text tokens.');const [cmd,...args]=tokens;
  switch(cmd){
   case 'help':return ['pwd                      Print working directory','ls [path]                List directory entries','cd <path> / cd ..        Change directory / go to parent','mkdir <path>             Make a directory','touch <path>             Create an empty file','help                     Show commands','run <name> <ticks> [io]   Create process (8 memory units)','tick [1..50] / step       Advance the virtual CPU','ps / mem / stats         Inspect processes, memory, scheduling','policy fcfs|sjf|rr        Switch policy when no process is running','demo                     Start export, music and an I/O editor','kill <pid>               End process and release memory/locks','write <name> <text>       Create or replace a text file','ls / cat <name>           Read your in-memory files','claim <pid> <r1> [r2..]   Acquire resources in your global order','release <pid>            Release that process’s resources','locks                    Inspect resource ownership','clear                    Clear the terminal','Files and processes reset on reboot. No quoting or pipes.'];
   case 'run':{if(args.length<2||args.length>3||(args[2]&&args[2]!=='io'))throw Error('Use run <name> <ticks> [io].');const p=await this.spawn(args[0],Number(args[1]),args[2]==='io');return [`PID ${p.pid}: ${p.name} READY · ${p.burst} ticks · 8 memory units`];}
   case 'demo':{if(this.free()<24)throw Error('Demo needs 24 free memory units.');const output=[];for(const [name,ticks,io] of [['export',12,false],['music',6,false],['editor',4,true]]){const p=await this.spawn(name,ticks,io);output.push(`PID ${p.pid}: ${name} READY${io?' · requests I/O after first tick':''}`);}return output.concat('Try tick 6, then ps.');}
   case 'tick':case 'step':{const count=args[0]===undefined?1:Number(args[0]);if(args.length>1||!Number.isInteger(count)||count<1||count>50)throw Error('Tick count must be an integer from 1 to 50.');const lines=[];for(let i=0;i<count;i++)lines.push(...await this.tick());return lines;}
   case 'ps':return ['PID  NAME           STATE     LEFT  WAIT  FIRST',...this.processes.map(p=>`${String(p.pid).padEnd(5)}${p.name.slice(0,14).padEnd(15)}${p.state.padEnd(10)}${String(p.remaining).padEnd(6)}${String(p.wait).padEnd(6)}${p.first===null?'—':p.first-p.arrival}`)];
   case 'mem':return [`${32-this.free()} / 32 units reserved · ${this.free()} free`];
   case 'stats':return [`time=${this.clock} · policy=${this.policy} · process switches=${this.switches}`,`READY=${this.ready.length} · BLOCKED=${this.processes.filter(p=>p.state==='BLOCKED').length} · DONE=${this.processes.filter(p=>p.state==='DONE').length}`];
   case 'policy':if(args.length!==1||!['fcfs','sjf','rr'].includes(args[0]))throw Error('Use policy fcfs, policy sjf or policy rr.');if(this.active!==null)throw Error('Wait until the running process finishes its turn before changing policy.');this.policy=args[0];return [`Policy → ${this.policy}`];
   case 'kill':{const p=this.processes.find(p=>p.pid===Number(args[0])&&p.state!=='DONE');if(!p)throw Error('No live process with that PID.');this.finish(p);return [`PID ${p.pid} ended. Memory and locks released.`];}
   case 'pwd':if(args.length)throw Error('pwd takes no arguments.');return [this.cwd];
   case 'cd':{if(args.length>1)throw Error('Use cd <directory>.');const dest=this.resolvePath(args[0]||'/home/student');if(!this.directories.has(dest))throw Error('Directory not found: '+dest);this.cwd=dest;return [this.cwd];}
   case 'mkdir':{if(args.length!==1)throw Error('Use mkdir <directory>.');const dest=this.resolvePath(args[0]);this.checkParent(dest);if(this.directories.has(dest)||Object.prototype.hasOwnProperty.call(this.files,dest))throw Error('Path already exists.');this.directories.add(dest);return ['Created directory '+dest];}
   case 'write':case 'touch':{if((cmd==='write'&&args.length<2)||(cmd==='touch'&&args.length!==1))throw Error('Use write <path> <text> or touch <path>.');const dest=this.resolvePath(args[0]);this.checkParent(dest);if(this.directories.has(dest))throw Error('Cannot write to a directory.');if(cmd==='touch'&&Object.prototype.hasOwnProperty.call(this.files,dest))return ['File already exists: '+dest];const content=cmd==='touch'?'':args.slice(1).join(' ');const result=await this.call(10,'write_file',this.files,dest,content);if(!result||typeof result[dest]!=='string')throw Error('File module returned an invalid result.');this.files=result;return [`Saved ${dest} (${result[dest].length} characters)`];}
   case 'ls':{if(args.length>1)throw Error('Use ls [directory].');const dest=this.resolvePath(args[0]||'.');if(!this.directories.has(dest))throw Error('Directory not found.');const prefix=dest==='/'?'/':dest+'/';const list=[];for(const d of this.directories){if(d.startsWith(prefix)&&d!==dest&&!d.slice(prefix.length).includes('/'))list.push(d.slice(prefix.length)+'/');}for(const f of Object.keys(this.files)){if(f.startsWith(prefix)&&!f.slice(prefix.length).includes('/'))list.push(f.slice(prefix.length));}return list.length?list.sort():['(empty directory)'];}
   case 'cat':{if(args.length!==1)throw Error('Use cat <path>.');const dest=this.resolvePath(args[0]);if(!Object.prototype.hasOwnProperty.call(this.files,dest))throw Error('File not found: '+dest);return [this.files[dest]];}
   case 'claim':{const pid=Number(args[0]);if(!this.processes.some(p=>p.pid===pid&&p.state!=='DONE'))throw Error('Use a live process PID.');const names=args.slice(1);if(!names.length||names.some(n=>!this.validName(n)))throw Error('Specify valid resource names.');const ordered=await this.call(9,'order_resources',names);if(!Array.isArray(ordered)||ordered.length!==names.length||ordered.some(n=>!names.includes(n)))throw Error('Invalid resource order.');for(const name of ordered){const owner=this.locks[name]??null;if(!await this.call(8,'can_acquire',owner,pid))throw Error(`${name} is owned by PID ${owner}. No new resources acquired; release and retry.`);}for(const name of ordered)this.locks[name]=pid;return [`PID ${pid} acquired: ${ordered.join(' → ')}`];}
   case 'release':{const pid=Number(args[0]);if(!Number.isInteger(pid)||pid<1)throw Error('Use release <pid>.');for(const key of Object.keys(this.locks))if(this.locks[key]===pid)delete this.locks[key];return [`PID ${pid}: resources released`];}
   case 'locks':return Object.keys(this.locks).length?Object.entries(this.locks).map(([n,p])=>`${n}: PID ${p}`):['No owned resources.'];
   case 'clear':return ['\u0000CLEAR'];
   default:throw Error(`Unknown command: ${cmd}. Type help.`);
  }
 }
 complete(line,cursor=line.length,allowedCommands=null){
  const commands=allowedCommands||['help','pwd','ls','cd','mkdir','touch','write','cat','run','tick','step','ps','mem','stats','policy','demo','kill','claim','release','locks','clear'];
  cursor=Math.max(0,Math.min(line.length,cursor));const head=line.slice(0,cursor),match=head.match(/[^\s]*$/),fragment=match?match[0]:'',start=cursor-fragment.length;
  const before=line.slice(0,start),tokens=before.trim().split(/\s+/).filter(Boolean);let end=cursor;while(end<line.length&&!/\s/.test(line[end]))end++;
  let candidates=[];
  if(tokens.length===0)candidates=commands.filter(c=>c.startsWith(fragment));
  else if(tokens[0]==='policy'&&tokens.length===1)candidates=['fcfs','sjf','rr'].filter(c=>c.startsWith(fragment));
  else if(['kill','release','claim'].includes(tokens[0])&&tokens.length===1)candidates=this.processes.filter(p=>p.state!=='DONE').map(p=>String(p.pid)).filter(p=>p.startsWith(fragment));
  else if(['cd','ls','cat','write','touch','mkdir'].includes(tokens[0])&&tokens.length===1){
   const split=fragment.lastIndexOf('/'),typedPrefix=split>=0?fragment.slice(0,split+1):'',partial=fragment.slice(split+1);
   try{const parent=this.resolvePath(typedPrefix||'.');if(this.directories.has(parent)){
    const prefix=parent==='/'?'/':parent+'/';
    for(const dir of this.directories)if(dir!==parent&&dir.startsWith(prefix)){const leaf=dir.slice(prefix.length);if(!leaf.includes('/')&&leaf.startsWith(partial))candidates.push(typedPrefix+leaf+'/');}
    if(!['cd','ls','mkdir'].includes(tokens[0]))for(const file of Object.keys(this.files))if(file.startsWith(prefix)){const leaf=file.slice(prefix.length);if(!leaf.includes('/')&&leaf.startsWith(partial))candidates.push(typedPrefix+leaf);}
    if(partial==='.'||partial==='..')candidates.push(typedPrefix+partial+'/');
   }}catch(_){}
  }
  candidates=[...new Set(candidates)].sort();if(!candidates.length)return {value:line,cursor,candidates,note:'No completion here. Commands are case-sensitive. Shift+Tab moves focus.'};
  let completion=candidates[0];for(const candidate of candidates)while(!candidate.startsWith(completion))completion=completion.slice(0,-1);
  if(completion.length<fragment.length)completion=fragment;
  const suffix=line.slice(end),space=candidates.length===1&&!completion.endsWith('/')&&!/^\s/.test(suffix)?' ':'';
  const replacement=completion+space;return {value:before+replacement+suffix,cursor:start+replacement.length,candidates,note:candidates.length===1?'Completed: '+candidates[0]:'Matches: '+candidates.join('  ')+' · type more, then Tab'};
 }
 resolvePath(path){if(typeof path!=='string'||!path)throw Error('Specify a path.');const parts=path.startsWith('/')?[]:this.cwd.split('/').filter(Boolean);for(const part of path.split('/')){if(!part||part==='.')continue;if(part==='..'){parts.pop();continue;}if(!this.validName(part))throw Error('Invalid path component: '+part);parts.push(part);}return '/'+parts.join('/');}
 checkParent(path){const parent=path.slice(0,path.lastIndexOf('/'))||'/';if(!this.directories.has(parent))throw Error('Parent directory does not exist: '+parent);}
 validName(name){return /^[\w.-]{1,40}$/.test(name)&&!['__proto__','constructor','prototype'].includes(name);}
}
function resourceTrace(orderA,orderB){
 const owners={},jobs=[{id:'A',order:[...orderA],index:0,held:[],done:false,waiting:null},{id:'B',order:[...orderB],index:0,held:[],done:false,waiting:null}],frames=[];
 const snap=(message,deadlock=false)=>frames.push({message,owners:{...owners},jobs:jobs.map(p=>({...p,order:[...p.order],held:[...p.held]})),deadlock});
 snap('Both jobs start with no resources.');
 for(let turn=0;turn<24&&!jobs.every(p=>p.done);turn++){
  const p=jobs[turn%2];if(p.done)continue;
  if(p.index===p.order.length){for(const r of p.held)delete owners[r];p.held=[];p.done=true;p.waiting=null;snap(p.id+' finishes and releases its resources.');continue;}
  const resource=p.order[p.index];if(!owners[resource]||owners[resource]===p.id){owners[resource]=p.id;p.held.push(resource);p.index++;p.waiting=null;snap(p.id+' acquires '+resource+'.');}else{p.waiting=resource;snap(p.id+' waits for '+resource+' (owned by '+owners[resource]+').');}
  if(jobs.every(j=>!j.done&&j.waiting&&owners[j.waiting]&&owners[j.waiting]!==j.id)){snap('Circular wait: neither job can reach its release step.',true);break;}
 }
 return frames;
}
function osClient(name,program){
 const kernel=new Kernel(name,program,execute);window.tinyKernel=kernel;
 const output=document.getElementById('output'),form=document.getElementById('command-form'),input=document.getElementById('command');let busy=true;const history=[];let historyIndex=0;
 const write=lines=>{for(const line of lines){if(line==='\u0000CLEAR'){output.textContent='';continue;}output.textContent+=line+'\n';}output.scrollTop=output.scrollHeight;};
 const render=()=>{document.getElementById('state').textContent='t='+kernel.clock+' | '+kernel.policy.toUpperCase()+' | memory '+(32-kernel.free())+'/32 | switches '+kernel.switches;document.getElementById('prompt').textContent=name+'@tinyOS:'+kernel.cwd+'$';document.getElementById('submit').disabled=busy;input.readOnly=busy;document.getElementById('input-status').textContent=busy?'Running command…':'Enter: run · Tab: complete commands / paths · ↑ / ↓: history · Shift+Tab: move focus';};
 async function command(line){if(busy||!line.trim())return;busy=true;history.push(line);historyIndex=history.length;render();write([name+'@tinyOS:'+kernel.cwd+'$ '+line]);try{write(await kernel.command(line));}catch(e){write(['error: '+e.message]);}finally{busy=false;render();input.focus();}return true;}
 window.runOSCommand=command;
 const submit=()=>{if(busy)return;const line=input.value;input.value='';command(line);};
 form.addEventListener('submit',e=>{e.preventDefault();submit();});
 input.addEventListener('keydown',e=>{if(e.key==='Tab'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(busy)return;const result=kernel.complete(input.value,input.selectionStart);input.value=result.value;input.setSelectionRange(result.cursor,result.cursor);document.getElementById('input-status').textContent=result.note;}else if(e.key==='Enter'&&!e.isComposing){e.preventDefault();submit();}else if(e.key==='ArrowUp'){e.preventDefault();historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||'';}else if(e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=history[historyIndex]||'';}});
 document.getElementById('submit').addEventListener('click',e=>{e.preventDefault();submit();});
 document.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>command(b.dataset.command)));
 output.addEventListener('click',()=>input.focus());
 kernel.boot().then(lines=>{write(lines);busy=false;render();input.focus();}).catch(e=>{write(['BOOT FAILED: '+e.message]);document.getElementById('input-status').textContent='Boot failed. Return to the workshop and verify your modules.';});
 render();
}
function buildOS(name,program){
 const safe=v=>JSON.stringify(v).replace(/</g,'\\u003c');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My tinyOS</title><style> *{box-sizing:border-box}body{margin:0;background:#101411;color:#dce6d7;font:14px/1.75 Consolas,monospace;padding:22px}h1{font-size:21px;font-weight:400;margin:0 0 5px}p{color:#9da998;margin:0 0 16px;font-size:12px}.bar{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}button{background:#222c1e;color:#c7e2b5;border:1px solid #46523e;padding:8px 11px;font:12px Consolas,monospace;cursor:pointer}button:disabled{opacity:.5}#output{white-space:pre-wrap;overflow-wrap:anywhere;height:47vh;min-height:210px;overflow:auto;border:1px solid #384232;padding:15px;background:#0b0e0b;margin:0}form{display:flex;gap:10px;align-items:center;border:1px solid #384232;border-top:0;padding:12px}#prompt{color:#b5d99c;font-size:12px}input{min-width:120px;min-height:42px;flex:1;border-bottom:1px solid #728467!important;background:transparent;color:#e9f2e3;border:0;padding:6px;font:14px Consolas,monospace}input:focus{outline:1px solid #b5d99c}small{display:block;color:#89957e;margin-top:14px;font-size:11px}@media(max-width:550px){body{padding:12px}form{flex-wrap:wrap}#prompt{width:100%}#output{font-size:12px}}</style></head><body><h1>&gt;_ Your machine is ready.</h1><p id="state">Booting…</p><div class="bar"><button data-command="help">help</button><button data-command="pwd">pwd</button><button data-command="demo">load demo</button><button data-command="tick 6">tick 6</button><button data-command="ps">ps</button><button data-command="mem">mem</button><button data-command="ls">ls</button></div><pre id="output" role="log" aria-live="polite"></pre><form id="command-form"><label id="prompt" for="command">tinyOS:~$</label><input id="command" placeholder="Type help and press Enter" autocomplete="off" spellcheck="false" aria-label="OS command"><button id="submit" type="submit">Enter</button></form><p id="input-status" role="status"></p><small>Browser-based teaching OS · your verified Python modules · one simulated core · RAM-only files reset on reboot</small><script>const PYTHON_RUNTIME_SOURCE=${safe(PYTHON_RUNTIME_SOURCE)};\n${pythonWorkerMain.toString()}\n${schedule_experiment.toString()}\n${execute.toString()}\n${Kernel.toString()}\n(${osClient.toString()})(${safe(name)},${safe(program)});<\/script></body></html>`;
}
const api={execute,schedule,schedule_experiment,Kernel,buildOS,pythonWorkerMain,resourceTrace};root.TinyOS=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
