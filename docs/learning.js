(()=>{
 const $=id=>document.getElementById(id),lessons=Workshop.lessons;
 const main=document.querySelector('main'),view=document.createElement('div');view.id='lesson-view';while(main.firstChild)view.append(main.firstChild);main.append(view);
 const overview=document.createElement('section');overview.id='overview-page';
 const taskDescriptions=[
  ['Start your OS','Give your OS a name and make it report that it is ready.'],
  ['Create a process','A process is a running program. Store its name, state and the CPU time it needs.'],
  ['Allocate memory','Give a process memory if enough is free. Reject the request if it does not fit.'],
  ['Run tasks in arrival order','Run the first task in the queue first. This is First-Come, First-Served (FCFS), also called FIFO.'],
  ['Let short tasks go first','Choose the task with the least work left. Compare its waiting time with FCFS.'],
  ['Give each task a turn','Run each task for a short time, then switch. This is Round Robin. See how quickly each task gets its first turn.'],
  ['Wait for a device','When a task waits for a file or device, let another task use the CPU.'],
  ['Handle a completion event','When the device finishes, put the waiting task back in the ready queue. It must wait for its next CPU turn.'],
  ['Protect shared data','Use a lock so two tasks cannot change the same data at the same time.'],
  ['Avoid a deadlock','See how two tasks can get stuck waiting for each other. Make them request locks in the same order.'],
  ['Save and read files','Connect file names to stored text. Try commands such as pwd, ls, cd and cat.'],
  ['Run your OS from a command line','Turn typed commands into words your OS can use. Connect your modules, start your OS and try it out.']
 ];
 overview.innerHTML=`
 <div class="section-kicker">OS WORKSHOP / START HERE</div>
 <h1>Welcome to the OS workshop.</h1>
 <p class="overview-lead">How does a computer share its CPU between programs? What happens when a program needs memory or waits for a file? In this workshop, you will write the rules that make these decisions.</p>
 <div class="overview-outcome"><h2>What will you build?</h2>
 <p>You will build a small operating system (OS) model in your browser. An OS manages the CPU, memory and files that programs use. You will start with an empty model and add one part at a time.</p>
 <p>By the end, you can start your OS, run tasks, watch them take turns on the CPU, and use commands to create and read files. You can also download your finished OS as a page that runs offline.</p>
 <p>This is a teaching model. It runs inside your browser; it does not replace Windows or macOS.</p></div>
 <h2>How will you build it?</h2>
 <p class="overview-copy">You will follow a simple engineering process: understand a problem, write a rule, test it and improve it. At the end, you will connect the parts and test them together.</p>
 <ol class="overview-method">
 <li><b>Read and predict.</b> Each task starts with a problem. Read the short explanation and predict what will happen.</li>
 <li><b>Write a little Python.</b> Complete a small function. The page shows its inputs and the result it should return.</li>
 <li><b>Run and observe.</b> Click Run. Watch the queues, memory or files change. Compare the result with your prediction.</li>
 <li><b>Explain and improve.</b> Record what you saw in a Tutor checkpoint. Discuss any questions with your tutor, then revise your code.</li>
 </ol>
 <h2>What will you do in each task?</h2>
 <p class="overview-copy">Tasks 00–02 set up the basics. Tasks 03–05 share CPU time. Tasks 06–09 handle waiting and shared resources. Tasks 10–11 add files and commands.</p>
 <ol class="overview-tasks">`+taskDescriptions.map((t,i)=>'<li><b>Task '+String(i).padStart(2,'0')+' / '+t[0]+'</b><p>'+t[1]+'</p></li>').join('')+`
 </ol>
 <div class="overview-outcome"><h2>What do you need before you start?</h2>
 <p>Basic Python: functions, if statements, loops, lists and dictionaries. You do not need to know JavaScript or install Linux. Everything you need to run the workshop is included in this page.</p>
 <p>You do not need to know OS theory yet. Each task introduces the idea you need before you write the code.</p></div>
 <button id="overview-start" class="primary">Start / continue workshop →</button>`;
 main.prepend(overview);
 const home=document.createElement('button');home.id='overview-nav';home.textContent='Overview / start here';$('task-nav').before(home);
 function showOverview(){view.hidden=true;overview.hidden=false;home.setAttribute('aria-current','page');window.scrollTo(0,0);}
 function showLesson(){view.hidden=false;overview.hidden=true;home.removeAttribute('aria-current');window.scrollTo(0,0);}
 home.onclick=showOverview;$('overview-start').onclick=showLesson;$('task-nav').addEventListener('click',e=>{if(e.target.closest('button:not(:disabled)'))showLesson();});
 const theory=document.createElement('section');theory.className='theory-reading';theory.innerHTML='<div class="mode-label">READ & PREDICT / BEFORE CODING</div><h2>What you need to understand</h2><p id="theory-body"></p><div class="prediction-cue"><b>Predict before you run</b><p id="theory-question"></p></div>';document.querySelector('.mission').after(theory);
 document.querySelector('.code-panel h2').textContent='02 / HANDS-ON CODING';document.querySelector('.lab-panel h2').textContent='03 / RUN & OBSERVE';document.querySelector('.takeaway h2').textContent='04 / EXPLAIN & REFLECT';
 function updateTheory(){const id=Number(($('task-path').textContent.match(/task_(\d+)/)||[])[1]||0);$('theory-body').textContent=lessons[id].concept;$('theory-question').textContent=lessons[id].reflection;}
 new MutationObserver(updateTheory).observe($('task-path'),{childList:true,characterData:true,subtree:true});updateTheory();
 const code=$('code'),wrap=code.parentElement,paint=document.createElement('pre');paint.id='syntax-paint';paint.setAttribute('aria-hidden','true');wrap.insertBefore(paint,code);code.spellcheck=false;code.wrap="off";code.setAttribute('aria-label','Python code editor with syntax highlighting');
 const escape=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 function highlight(s){const pattern=/(#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|return|if|else|for|in|is|not|and|or|while|import|from|as|pass|break|continue|lambda)\b|\b(?:None|True|False)\b|\b\d+(?:\.\d+)?\b|[()[\]{}])/g;let out='',start=0;for(const m of s.matchAll(pattern)){out+=escape(s.slice(start,m.index));const t=m[0],cls=t[0]==='#'?'comment':/^["']/.test(t)?'string':/^(None|True|False)$/.test(t)?'constant':/^\d/.test(t)?'number':/^[()[\]{}]$/.test(t)?'bracket':'keyword';out+='<span class="py-'+cls+'">'+escape(t)+'</span>';start=m.index+t.length;}return out+escape(s.slice(start));}
 function paintCode(){paint.innerHTML=highlight(code.value)+'\n';paint.scrollTop=code.scrollTop;paint.scrollLeft=code.scrollLeft;}
 code.addEventListener('input',paintCode);code.addEventListener('scroll',paintCode);document.addEventListener('click',()=>requestAnimationFrame(paintCode));new MutationObserver(()=>requestAnimationFrame(paintCode)).observe($('task-path'),{childList:true,subtree:true});paintCode();
 window.WorkshopLearning={highlight,paintCode};showOverview();
})();
