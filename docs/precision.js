/* Read-only line numbers; never changes learner code or execution. */
(()=>{
 const code=document.getElementById('code');
 const gutter=document.querySelector('.editor-marker');
 const numbers=document.createElement('pre');
 gutter.replaceChildren(numbers);
 const update=()=>{const count=code.value.split('\n').length;numbers.textContent=Array.from({length:count},(_,i)=>String(i+1).padStart(2,'0')).join('\n');numbers.style.transform=`translateY(${-code.scrollTop}px)`;};
 code.addEventListener('input',update);
 code.addEventListener('scroll',update);
 document.addEventListener('click',()=>requestAnimationFrame(update));
 update();
})();
