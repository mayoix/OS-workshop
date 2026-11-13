const assert=require('node:assert/strict');
const {Kernel}=require('../docs/kernel.js');
const {ioFrames}=require('../docs/experiments.js');
const k=new Kernel('test',[],null);k.files={'/home/student/welcome.txt':'hello','/home/student/west.txt':'west','/home/student/projects/note':'text'};
assert.equal(k.complete('pw').value,'pwd ');
assert.deepEqual(k.complete('c').candidates,['cat','cd','claim','clear']);assert.equal(k.complete('c').value,'c');
assert.equal(k.complete('cd pro').value,'cd projects/');
assert.equal(k.complete('cat wel').value,'cat welcome.txt ');
assert.equal(k.complete('cat /home/stu').value,'cat /home/student/');
assert.equal(k.complete('cat /home/student/wel').value,'cat /home/student/welcome.txt ');
assert.equal(k.complete('cat we').value,'cat we');assert.equal(k.complete('cat we').candidates.length,2);
assert.equal(k.complete('cd ..').value,'cd ../');
k.cwd='/home/student/projects';assert.equal(k.complete('cat ../wel').value,'cat ../welcome.txt ');
assert.equal(k.complete('cat n').value,'cat note ');assert.equal(k.complete('cat nXYZ after',5).value,'cat note after');
assert.equal(k.complete('cat does-not-exist').value,'cat does-not-exist');assert.equal(k.complete('PWD').candidates.length,0);
assert.equal(k.complete('ru',2,['pwd','ls']).candidates.length,0);assert.equal(k.complete('policy r').value,'policy rr ');
assert.equal(k.cwd,'/home/student/projects');assert.equal(k.clock,0,'completion must not execute anything');
for(let latency=2;latency<=6;latency++){const blocked=ioFrames('BLOCKED',latency),polling=ioFrames('RUNNING',latency);assert.equal(blocked[0].time,0);assert.equal(blocked.at(-1).useful,latency);assert.equal(blocked.at(-1).polls,0);assert.equal(polling.at(-1).useful,0);assert.equal(polling.at(-1).polls,latency);assert.equal(blocked.at(-1).editor,'BLOCKED','Task 06 must not wake Editor before Task 07');assert.equal(blocked.at(-1).progress,polling.at(-1).progress);}
console.log('PASS: context-sensitive Tab completion, relative/absolute paths, ambiguity, cursor edits, no side effects; I/O lane models and delayed wakeup');

