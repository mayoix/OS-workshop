(function(root){
 'use strict';
 const prompts=[
  ['What visible evidence would convince you that your OS has initialized?', 'Compare the returned record with the boot console. Which check stops the sequence?', 'Ask your tutor what belongs to initialization and what still needs to be built.'],
  ['How many records should two calls to one function produce?', 'Match each call’s arguments to its returned dictionary. Is the state eligible for the CPU?', 'Explain the difference between defining a recipe and using it twice.'],
  ['For each independent pool, predict granted and remaining units before running.', 'Find the smallest input where your current allocation rule fails.', 'Show your tutor why an exact-fit request differs from an oversized one.'],
  ['Which task will be delayed longest if the first arrival runs to completion?', 'Pause at a tick boundary. Who owns the CPU, and who is waiting?', 'Use the timeline to explain where the waiting-time number came from.'],
  ['Without coding, walk through the three dictionaries and choose the next task.', 'Track which dictionary your loop currently considers best. Which field are you comparing?', 'Explain your selection rule on a different queue before asking about syntax.'],
  ['What will change if turns get shorter: first response, waiting, or switching?', 'Compare one changed metric and one metric that did not improve.', 'Ask your tutor which objective matters for an interactive application.'],
  ['While file data travels, which process can do useful work on the CPU?', 'Compare the CPU lane with the device lane. Does blocking make the device faster?', 'Explain why a blocked process still needs its identity and memory.'],
  ['Who currently owns the CPU when the completion event arrives?', 'Try the invalid-state experiment. Which invariant is broken before the next tick?', 'Tell your tutor what operation is missing between becoming eligible and actually running.'],
  ['Write down an interleaving that loses one increment.', 'Which ownership case must be rejected, and which cases can proceed?', 'Explain the start and end of the critical section in your own words.'],
  ['Draw who holds each resource and who waits for whom.', 'Step both traces. Does the waiting process hold a resource the other one needs?', 'Explain why every process must obey the order, not just one of them.'],
  ['Predict which existing filename should still exist after a write.', 'Use pwd before cat. Distinguish a missing file from a file in another directory.', 'Explain to your tutor how paths are resolved from the current directory.'],
  ['Separate the command and arguments of a new input string by hand.', 'Try leading spaces, repeated spaces and a one-word command.', 'Explain how a list of words becomes a request to a specific OS service.']
 ];
 let hooks=null;
 const $=id=>document.getElementById(id);
 function init(options){
  hooks=options;
  $('checkpoint').onclick=()=>open();$('summary-checkpoint').onclick=()=>open();
  $('close-tutor').onclick=()=>$('tutor-dialog').close();
  $('checkpoint-form').onsubmit=e=>{e.preventDefault();const record={prediction:$('prediction').value.trim(),observation:$('observation').value.trim(),question:$('tutor-question').value.trim()};if(Object.values(record).some(v=>!v)){ $('checkpoint-status').textContent='Add your prediction, one observation and a question first.';return;}hooks.save(record);$('checkpoint-status').textContent='Discussion card saved on this browser. Show it to your tutor; it has not been sent or reviewed automatically.';renderCard(record);};
  $('reference-task').innerHTML=hooks.lessons.map((t,i)=>`<option value="${i}">Task ${String(i).padStart(2,'0')} — ${t.nav}</option>`).join('');
  $('reference-task').onchange=resetReference;
  $('tutor-discussed').onchange=()=>{$('show-reference').disabled=!$('tutor-discussed').checked;if(!$('tutor-discussed').checked)$('tutor-reference').hidden=true;};
  $('show-reference').onclick=()=>{const id=Number($('reference-task').value);$('tutor-reference').textContent=hooks.lessons[id].solution;$('tutor-reference').hidden=false;};
 }
 function thinkingPrompt(id){return prompts[id][0]+' '+prompts[id][1];}
 function resetReference(){$('tutor-discussed').checked=false;$('show-reference').disabled=true;$('tutor-reference').hidden=true;}
 function prepareFacilitator(id){$('reference-task').value=String(id);resetReference();}
 function renderCard(record){const state=hooks.read();$('discussion-card').textContent=`Task ${String(state.task).padStart(2,'0')} / ${hooks.lessons[state.task].nav}\n\nPREDICTION\n${record.prediction}\n\nOBSERVATION\n${record.observation}\n\nQUESTION FOR MY TUTOR\n${record.question}\n\nMY CURRENT PATCH\n${state.code}\n\nLATEST VISIBLE FEEDBACK\n${state.feedback}`;$('discussion-card').hidden=false;}
 function open(){const state=hooks.read(),record=state.record||{};
  $('tutor-title').textContent='Tutor checkpoint / Task '+String(state.task).padStart(2,'0');$('tutor-prompts').textContent=prompts[state.task].join('\n\n');
  $('prediction').value=record.prediction||'';$('observation').value=record.observation||'';$('tutor-question').value=record.question||'';$('checkpoint-status').textContent='This is a conversation with your human tutor. There is no automatic answer reveal.';$('discussion-card').hidden=true;if(record.prediction)renderCard(record);$('tutor-dialog').showModal();$('prediction').focus();
 }
 root.WorkshopTutor={init,thinkingPrompt,prepareFacilitator};
})(window);
