(function(root){
'use strict';
const lessons = [
  {
    "id": 0,
    "nav": "Power on",
    "phase": "FOUNDATION / IDENTITY",
    "title": "A blank machine. A first instruction.",
    "question": "You press the power button. Who tells the computer what to do?",
    "module": "boot",
    "file": "boot.py",
    "duration": "5 min",
    "problem": "The browser provides a simulated machine, Python runner and display. You write its OS rules. This first task only initializes a name and startup status.",
    "mission": "Name your OS in the sidebar, then return a boot record with online set to true.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "boot",
    "starter": "def boot(name):\n    # name comes from the OS name field. Only identity and startup status are initialized here.\n    # TODO: Change the online flag to report successful initialization.\n    return {\"name\": name, \"online\": False}",
    "solution": "def boot(name):\n    return {\"name\": name, \"online\": True}",
    "hint": "name comes from the OS name field. Only identity and startup status are initialized here.",
    "conceptTitle": "Bootstrapping: the first trusted step",
    "concept": "A real boot process loads and starts a kernel. Here the browser supplies the virtual machine; your boot function initializes its identity and running state. A successful boot is the start of the system, not a complete OS.",
    "reflection": "What should happen if one essential module fails during boot?",
    "bridge": "Your machine is awake. But it has no idea what a program is.",
    "data": "Input: boot(\"atlas\")\nname is a string. The output is a dictionary: {\"name\": \"atlas\", \"online\": True}.",
    "explain": [
      "name comes from the OS name field. Only identity and startup status are initialized here.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "Your record now preserves the name and reports online. This starts our model, not a real hardware kernel. Processes and scheduling still need to be built."
  },
  {
    "id": 1,
    "nav": "Create a process",
    "phase": "FOUNDATION / PROCESSES",
    "title": "Give work a place to live.",
    "question": "How does an OS remember that a program still has work to do?",
    "module": "process",
    "file": "process.py",
    "duration": "6 min",
    "problem": "You are writing the OS function, not using an application. The test calls it twice. Return each record READY to join the queue; the runner will not change NEW to READY for you.",
    "mission": "Create a process record that starts in READY with its requested CPU time remaining.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "create_process",
    "starter": "def create_process(name, ticks):\n    # name is the program name; ticks is CPU work needed. Return a ready-to-queue record.\n    # TODO: Change the initial state so the record is eligible for scheduling.\n    return {\"name\": name, \"remaining\": ticks, \"state\": \"NEW\"}",
    "solution": "def create_process(name, ticks):\n    process = {}\n    process[\"name\"] = name\n    process[\"remaining\"] = ticks\n    process[\"state\"] = \"READY\"\n    return process",
    "hint": "name is the program name; ticks is CPU work needed. Return a ready-to-queue record.",
    "conceptTitle": "A process is a program in execution",
    "concept": "The OS keeps a process control block: identity, state and execution information. Our record is a small version of that structure. READY is different from RUNNING: many processes can be ready, but this single core runs one at a time.",
    "reflection": "Can three processes be READY at the same time? Can all three be RUNNING on our one core?",
    "bridge": "A process now exists. Where can it keep its data?",
    "data": "Call 1: create_process(\"editor\", 6)\nCall 2: create_process(\"chat\", 1)\n\nExample record: {\"name\": \"editor\", \"remaining\": 6, \"state\": \"READY\"}",
    "explain": [
      "name is the program name; ticks is CPU work needed. Return a ready-to-queue record.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "The OS stores program identity, remaining work and state in a record. Two calls produce two records. Both can be READY; only one can run on this CPU."
  },
  {
    "id": 2,
    "nav": "Reserve memory",
    "phase": "FOUNDATION / MEMORY",
    "title": "There is only so much room.",
    "question": "What happens if two programs ask for more memory than you have?",
    "module": "memory",
    "file": "memory.py",
    "duration": "7 min",
    "problem": "Your machine has 32 memory units. A request must succeed in full or fail safely. Granting more than the free amount would make the accounting impossible.",
    "mission": "Return the requested amount when it fits; otherwise return 0.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "allocate",
    "starter": "def allocate(free, requested):\n    # free is available memory; requested is the amount needed. Each call uses a separate pool.\n    # TODO: Grant requested units if they fit; otherwise return zero.\n    return requested",
    "solution": "def allocate(free, requested):\n    if free >= requested:\n        return requested\n    else:\n        return 0",
    "hint": "free is available memory; requested is the amount needed. Each call uses a separate pool.",
    "conceptTitle": "Allocation is a promise the OS must keep",
    "concept": "The allocator accounts for a finite resource. This model reserves fixed-size units and rejects requests that do not fit. Real systems add address spaces, protection and virtual memory; those are outside this small allocator.",
    "reflection": "When a process finishes, what should happen to the units reserved for it?",
    "bridge": "We have processes and memory. The CPU is still waiting for a selection rule.",
    "data": "Case A: allocate(32, 8) \u2192 8\nCase B: allocate(4, 8) \u2192 0\nExtra checks: allocate(8, 8) \u2192 8; allocate(0, 1) \u2192 0.",
    "explain": [
      "free is available memory; requested is the amount needed. Each call uses a separate pool.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "The four separate grants are 8, 0, 8 and 0. Exact-fit requests succeed; oversized requests must fail."
  },
  {
    "id": 3,
    "nav": "Choose who runs",
    "phase": "CPU / FIRST COME, FIRST SERVED",
    "title": "Who runs first?",
    "question": "Video Export, Music Player and Chat Message all arrive together. Who gets the CPU?",
    "module": "fcfs",
    "file": "scheduler-fcfs.py",
    "duration": "7 min",
    "problem": "All three processes are READY at t=0. Without a scheduler, the CPU cannot decide which one to run. Start with the simplest fair-to-arrivals rule.",
    "mission": "Select the first process in the ready queue. Let it finish before choosing again.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "choose_next",
    "starter": "def choose_next(queue):\n    # queue is a list of process dictionaries. Index 0 is the first arrival.\n    # TODO: Select the first process.\n    return None",
    "solution": "def choose_next(queue):\n    first_process = queue[0]\n    return first_process",
    "hint": "queue is a list of process dictionaries. Index 0 is the first arrival.",
    "conceptTitle": "FCFS: first come, first served",
    "concept": "A non-preemptive scheduler lets the selected task run until it finishes or blocks. FCFS follows arrival order. A long task can hold up short tasks behind it: the convoy effect.",
    "reflection": "Chat needs only 4 ticks. Why does it wait for 18 before it can start?",
    "bridge": "The queue is orderly. The experience is not. Can short work finish sooner?",
    "data": "queue = [\n    {\"id\": \"V\", \"name\": \"Video Export\", \"remaining\": 12},\n    {\"id\": \"M\", \"name\": \"Music Player\", \"remaining\": 6},\n    {\"id\": \"C\", \"name\": \"Chat Message\", \"remaining\": 4}\n]\n\nInput: choose_next(queue). Return one whole process dictionary.",
    "explain": [
      "queue is a list of process dictionaries. Index 0 is the first arrival.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "FCFS runs the first arrival to completion. The long export delays the short jobs; the timeline explains their waiting time."
  },
  {
    "id": 4,
    "nav": "Rescue short jobs",
    "phase": "CPU / SHORTEST JOB FIRST",
    "title": "Four ticks of work. Eighteen ticks of waiting.",
    "question": "Can one small code change reduce the time everyone spends waiting?",
    "module": "sjf",
    "file": "scheduler-sjf.py",
    "duration": "7 min",
    "problem": "FCFS left Chat waiting for 18 ticks. Keep the exact same tasks and arrival times, but choose the process with the least remaining work.",
    "mission": "Walk through the queue and remember the process with the smallest remaining value.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "choose_next",
    "starter": "def choose_next(queue):\n    # Each dictionary has remaining: CPU ticks still needed. Compare that field.\n    # TODO: Find the process with the smallest remaining value.\n    return queue[0]",
    "solution": "def choose_next(queue):\n    shortest = queue[0]\n    for process in queue:\n        if process[\"remaining\"] < shortest[\"remaining\"]:\n            shortest = process\n    return shortest",
    "hint": "Each dictionary has remaining: CPU ticks still needed. Compare that field.",
    "conceptTitle": "SJF improves one objective, not every objective",
    "concept": "For this fixed set of jobs with known durations and equal arrival times, non-preemptive SJF reduces average waiting from 10.00 to 4.67 ticks. Real systems rarely know exact future CPU bursts; predictions can be wrong and long tasks can starve.",
    "reflection": "Does a lower average waiting time mean every individual process starts sooner?",
    "bridge": "The export still sees no CPU until t=10. Can every application get a response earlier?",
    "data": "queue = [\n    {\"id\": \"V\", \"name\": \"Video Export\", \"remaining\": 12},\n    {\"id\": \"M\", \"name\": \"Music Player\", \"remaining\": 6},\n    {\"id\": \"C\", \"name\": \"Chat Message\", \"remaining\": 4}\n]\n\nprocess[\"remaining\"] reads the value under the \"remaining\" key.",
    "explain": [
      "Each dictionary has remaining: CPU ticks still needed. Compare that field.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "SJF runs shorter jobs first in this non-preemptive model, reducing average wait here. Real systems rarely know exact future CPU durations."
  },
  {
    "id": 5,
    "nav": "Share CPU time",
    "phase": "CPU / ROUND ROBIN",
    "title": "Make the computer feel alive.",
    "question": "How can several applications appear to make progress at once on one core?",
    "module": "quantum",
    "file": "timeslice.py",
    "duration": "8 min",
    "problem": "SJF improves average waiting, but the longest process starts late. Return to queue order and interrupt each turn after a short time slice.",
    "mission": "Give each process at most 2 ticks, or its remaining time if that is smaller.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "time_slice",
    "starter": "def time_slice(remaining):\n    # Time quantum q = 2 means at most two ticks per turn. remaining is work left.\n    # TODO: Limit this turn to the quantum and remaining work.\n    return remaining",
    "solution": "def time_slice(remaining):\n    quantum = 2\n    if remaining > quantum:\n        return quantum\n    else:\n        return remaining",
    "hint": "Time quantum q = 2 means at most two ticks per turn. remaining is work left.",
    "conceptTitle": "Round Robin: responsiveness has a cost",
    "concept": "With q=2, average first response falls from SJF\u2019s 4.67 to 2.00 ticks. Process-to-process switches increase from 2 to 8. Average waiting is 9.33 ticks: better response does not mean better waiting. We count identity changes and ignore switch duration.",
    "reflection": "Change quantum from 2 to 1, run, then Play. How do first response and switching change?",
    "bridge": "So far, every task could use any CPU turn it received. Now imagine editor needs file data before its next calculation. More CPU time cannot make that data arrive. Should it keep taking turns while it waits, or let useful work run?",
    "data": "time_slice(12) \u2192 2\ntime_slice(1) \u2192 1\ntime_slice(4) \u2192 2",
    "explain": [
      "Time quantum q = 2 means at most two ticks per turn. remaining is work left.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "With q = 2, tasks get short turns. First response improves, but switching increases; lower response time does not imply lower average waiting. Switch duration is ignored."
  },
  {
    "id": 6,
    "nav": "Wait without freezing",
    "phase": "EVENTS / BLOCKING I/O",
    "title": "Waiting is not working.",
    "question": "Should a process hold the CPU while its file is still loading?",
    "module": "io",
    "file": "io.py",
    "duration": "6 min",
    "problem": "The editor asks for disk data. The data will take a few ticks to arrive. Keeping it runnable would waste CPU turns that another process could use.",
    "mission": "Move the process to BLOCKED while it waits for I/O. Preserve the other fields.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "on_io",
    "starter": "def on_io(process):\n    # copy() preserves process fields while you change its state.\n    # TODO: Change the waiting state; preserve the other fields.\n    updated = process.copy()\n    updated[\"state\"] = \"RUNNING\"\n    return updated",
    "solution": "def on_io(process):\n    updated = process.copy()\n    updated[\"state\"] = \"BLOCKED\"\n    return updated",
    "hint": "copy() preserves process fields while you change its state.",
    "conceptTitle": "Blocking releases the CPU, not the process",
    "concept": "An I/O-bound process remains alive with its memory intact while blocked. It leaves the ready queue, letting the CPU serve other work. This model uses a scheduled I/O completion event rather than a real disk.",
    "reflection": "If every process is blocked, is an idle CPU necessarily a scheduling bug?",
    "bridge": "The file has arrived. A blocked process will not wake itself.",
    "data": "process = {\"id\": 1, \"name\": \"editor\", \"remaining\": 5, \"state\": \"RUNNING\"}\nInput: on_io(process)\nChange only state to \"BLOCKED\".",
    "explain": [
      "copy() preserves process fields while you change its state.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "Blocking lets Music compute while Editor waits. Device delay stays the same. Without another READY task, the CPU would be idle."
  },
  {
    "id": 7,
    "nav": "Deliver an interrupt",
    "phase": "EVENTS / WAKEUP",
    "title": "The file is ready. Tell the OS.",
    "question": "How does waiting work get back into the running system?",
    "module": "interrupt",
    "file": "interrupt.py",
    "duration": "6 min",
    "problem": "An I/O completion event has arrived. The editor must rejoin the ready queue without stealing the CPU directly from the current process.",
    "mission": "Change BLOCKED to READY when the completion event is delivered.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "on_interrupt",
    "starter": "def on_interrupt(process):\n    # The completion event makes a waiting process eligible; it does not assign the CPU.\n    # TODO: Make this process eligible without taking the CPU.\n    updated = process.copy()\n    updated[\"state\"] = \"BLOCKED\"\n    return updated",
    "solution": "def on_interrupt(process):\n    updated = process.copy()\n    updated[\"state\"] = \"READY\"\n    return updated",
    "hint": "The completion event makes a waiting process eligible; it does not assign the CPU.",
    "conceptTitle": "Events reconnect the outside world to the scheduler",
    "concept": "In a real system, device interrupts notify the kernel of events. The handler records completion and may wake a blocked process. READY is not an immediate guarantee of CPU time. Our event queue models that wakeup at a tick boundary.",
    "reflection": "Why wake the editor into READY rather than directly into RUNNING?",
    "bridge": "Tasks can now overlap. What if two of them touch the same shared value?",
    "data": "Before interrupt: music = RUNNING; editor = BLOCKED.\nCPU currently belongs to music.\nInput: on_interrupt(editor)\nExpected: editor becomes READY, not a second CPU owner.",
    "explain": [
      "The completion event makes a waiting process eligible; it does not assign the CPU.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "The completion event changes BLOCKED to READY. Only a scheduler decision can assign the CPU. Direct RUNNING can conflict with its current owner."
  },
  {
    "id": 8,
    "nav": "Protect shared state",
    "phase": "COORDINATION / MUTUAL EXCLUSION",
    "title": "Two increments. One missing update.",
    "question": "Both processes add 1 to the same counter. Why does the result become 1 instead of 2?",
    "module": "lock",
    "file": "mutex.py",
    "duration": "8 min",
    "problem": "First step through the unlocked example below. Adding one means reading, calculating and writing. Tasks can take turns between these steps. Observe the problem before implementing a lock.",
    "mission": "Grant access only when the lock is free or already owned by that process.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "can_acquire",
    "starter": "def can_acquire(owner, pid):\n    # owner is None for a free lock or a process ID. pid is the requesting process.\n    # TODO: Allow a free lock or its current owner; reject others.\n    return True",
    "solution": "def can_acquire(owner, pid):\n    if owner is None:\n        return True\n    if owner == pid:\n        return True\n    return False",
    "hint": "owner is None for a free lock or a process ID. pid is the requesting process.",
    "conceptTitle": "A mutex protects a critical section",
    "concept": "Mutual exclusion prevents two processes from entering the protected read-modify-write region simultaneously. A process must release the lock after its critical section. This toy owner check allows the same owner to continue; it does not implement a recursive lock count.",
    "reflection": "What if a process holds one lock and waits for another forever?",
    "bridge": "A lock fixes one race. Two locks can introduce another problem.",
    "data": "can_acquire(None, \"A\") \u2192 True\ncan_acquire(\"A\", \"B\") \u2192 False\ncan_acquire(\"A\", \"A\") \u2192 True",
    "explain": [
      "owner is None for a free lock or a process ID. pid is the requesting process.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "Both tasks can read 0 and write 1 without protection. A lock lets one complete its read-modify-write before the other reads, producing 2. The owner must release it."
  },
  {
    "id": 9,
    "nav": "Break a deadlock",
    "phase": "COORDINATION / RESOURCE ORDERING",
    "title": "Everyone is waiting for someone else.",
    "question": "A holds disk and wants screen. B holds screen and wants disk. Who moves?",
    "module": "order",
    "file": "resources.py",
    "duration": "8 min",
    "problem": "A requests [disk, screen]; B requests [screen, disk]. If both acquire their first resource, each holds what the other needs. The problem is opposite acquisition orders\u2014not the names themselves.",
    "mission": "Give every process the same total order. Here the agreed order is alphabetical: disk before screen.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "order_resources",
    "starter": "def order_resources(resources):\n    # resources is a list of names. Use a common acquisition order for every caller.\n    # TODO: Return a new list in a shared order.\n    return resources",
    "solution": "def order_resources(resources):\n    # The shared rule: alphabetical order, for every process.\n    ordered = sorted(resources)\n    return ordered",
    "hint": "resources is a list of names. Use a common acquisition order for every caller.",
    "conceptTitle": "Prevent the cycle before it forms",
    "concept": "Sorting is not a magic deadlock cure. It implements one shared resource order. If every process acquires locks in increasing order, a circular chain of resource dependencies cannot form. The lab restarts the jobs and applies that rule; it does not repair locks already held in a deadlock.",
    "reflection": "Would this guarantee still hold if just one process ignored the order?",
    "bridge": "Your OS coordinates work. Now give it somewhere to keep a result.",
    "data": "A requests [\"disk\", \"screen\"]\nB requests [\"screen\", \"disk\"]\n\nYour rule must make BOTH lists become [\"disk\", \"screen\"].\nThe same global ordering rule must work for other resource names too.",
    "explain": [
      "resources contains names such as [\"screen\", \"disk\"].",
      "sorted(resources) returns a new ordered list without changing the original.",
      "return sends this list back; the separate animation explains resource requests."
    ],
    "answer": "A shared resource order prevents the illustrated circular wait. Every job must follow it. Alphabetical order is convenient, not a universal deadlock cure."
  },
  {
    "id": 10,
    "nav": "Keep a file",
    "phase": "USABILITY / FILE SYSTEM",
    "title": "Programs finish. Their work should remain.",
    "question": "How can one program leave a result for another program to read?",
    "module": "files",
    "file": "filesystem.py",
    "duration": "6 min",
    "problem": "You can run a computation, but there is no way to name its output. Add a tiny file store: names map to text, and writing one file must preserve the others.",
    "mission": "Return the existing files plus the requested name and content.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "write_file",
    "starter": "def write_file(files, name, content):\n    # files maps names to text; name is the target filename; content is new text.\n    # TODO: Keep existing files and add or update this filename.\n    return {name: content}",
    "solution": "def write_file(files, name, content):\n    updated_files = files.copy()\n    updated_files[name] = content\n    return updated_files",
    "hint": "files maps names to text; name is the target filename; content is new text.",
    "conceptTitle": "A name turns bytes into something reusable",
    "concept": "Our in-memory file system supports named text files, listing and reading. Files survive process completion but not an OS reboot. Real file systems add durable storage, directories, permissions and crash recovery.",
    "reflection": "What additional layer would be needed to keep a file after you close this browser page?",
    "bridge": "All the services exist. There is only one thing missing: a way for a human to ask for them.",
    "data": "files = {\"hello\": \"welcome\"}\nwrite_file(files, \"note\", \"I built this.\")\nExpected: {\"hello\": \"welcome\", \"note\": \"I built this.\"}",
    "explain": [
      "files is the existing dictionary; name and content are separate parameters.",
      "files.copy() preserves old entries in a new dictionary.",
      "updated_files[name] = content uses the value of name, not the literal key \"name\".",
      "return sends the updated store back."
    ],
    "answer": "A write adds or replaces one filename while preserving unrelated entries. These files are in memory and do not survive reboot."
  },
  {
    "id": 11,
    "nav": "Boot your own OS",
    "phase": "ASSEMBLY / SHELL",
    "title": "This time, you are the OS author.",
    "question": "Can a few words at a prompt operate the system you just built?",
    "module": "shell",
    "file": "shell.py",
    "duration": "10 min",
    "problem": "You built processes, memory and scheduling. How can a person ask them to work? A shell receives typed commands. It separates the command and arguments, then the dispatcher calls the right service.",
    "mission": "Turn an input string into a list of words. Then boot your OS and type commands followed by Enter.",
    "instruction": "Read the commented code, check the actual calls below, then complete the TODO and Run.",
    "fn": "parse_command",
    "starter": "def parse_command(line):\n    # line is the whole command. The provided dispatcher executes the returned words.\n    # TODO: Remove outer whitespace, split into words, return the list.\n    return [line]",
    "solution": "def parse_command(line):\n    # Remove whitespace at the beginning and end.\n    cleaned_line = line.strip()\n    # With no separator, split groups of whitespace into words.\n    words = cleaned_line.split()\n    return words",
    "hint": "line is the whole command. The provided dispatcher executes the returned words.",
    "conceptTitle": "A shell connects people to kernel services",
    "concept": "The completed model boots with your module code. Its shell creates processes, reserves memory, selects work, blocks and wakes I/O tasks, enforces locks and manages named files. The browser supplies the virtual hardware; this is a runnable teaching OS, not a hardware-bootable kernel.",
    "reflection": "Run demo, then tick 6 and ps. Which parts of that behavior came from code you wrote?",
    "bridge": "Your build is complete. Boot it here or export a standalone HTML file that runs offline.",
    "data": "Input: \"run editor 6\"\nOutput: [\"run\", \"editor\", \"6\"]\n\nInput: \"  write   note  hello  \"\nOutput: [\"write\", \"note\", \"hello\"]\n\nInput: \"pwd\" \u2192 [\"pwd\"]\nInput: \"ls\" \u2192 [\"ls\"]\nInput: \"cd ..\" \u2192 [\"cd\", \"..\"]",
    "explain": [
      "line is the whole command. The provided dispatcher executes the returned words.",
      "return sends the result to the caller. The TODO marks your change."
    ],
    "answer": "The parser returns words. The dispatcher calls the appropriate OS service. Parsing alone does not run the command."
  }
];
function callsFor(id,name='atlas'){
 switch(id){
 case 0:return [[name],['test-os']];
 case 1:return [['editor',6],['chat',1]];
 case 2:return [[32,8],[4,8],[8,8],[0,1]];
 case 3:case 4:return [[[ {id:'V',name:'Video Export',remaining:12},{id:'M',name:'Music Player',remaining:6},{id:'C',name:'Chat Message',remaining:4} ]],[[{id:'A',remaining:7},{id:'B',remaining:2}]]];
 case 5:return [[12],[1],[4]];
 case 6:return [[{id:1,name:'editor',remaining:5,state:'RUNNING'}],[{id:2,name:'chat',remaining:2,state:'RUNNING'}]];
 case 7:return [[{id:1,name:'editor',remaining:5,state:'BLOCKED'}],[{id:2,name:'chat',remaining:2,state:'BLOCKED'}]];
 case 8:return [[null,'A'],['A','B'],['A','A'],['B','A']];
 case 9:return [[['disk','screen']],[['screen','disk']],[['z','a','m']]];
 case 10:return [[{hello:'welcome'},'note','I built this.'],[{a:'one',b:'two'},'a','new']];
 case 11:return [['run editor 6'],['  write   note  hello  '],['pwd'],['ls'],['cd ..']];
 }
}
function validate(id,results,name='atlas'){
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const expect=(ok,message)=>{if(!ok)throw Error(message);};
 expect(Array.isArray(results),'The module did not return a result.');
 switch(id){
 case 0:expect(results[0]?.name===name&&results[0]?.online===true&&results[1]?.name==='test-os'&&results[1]?.online===true,'Boot must preserve the supplied name and set online to true.');break;
 case 1:expect(results.every((p,i)=>p&&p.name===(i?'chat':'editor')&&p.remaining===(i?1:6)&&p.state==='READY'),'A new process needs its name, requested remaining time and state READY.');break;
 case 2:expect(equal(results,[8,0,8,0]),'A request that fits must succeed; a request larger than free memory must return 0.');break;
 case 3:expect(results[0]?.id==='V'&&results[1]?.id==='A','FCFS must select the first item from either queue.');break;
 case 4:expect(results[0]?.id==='C'&&results[1]?.id==='B','Choose the shortest remaining task, not its position or name.');break;
 case 5:expect(results.every((n,i)=>Number.isInteger(n)&&n>0&&n<=2&&n<=[12,1,4][i]),'Each time slice must be 1 or 2 ticks and no greater than remaining work.');break;
 case 6:case 7:expect(results.every((p,i)=>p&&p.id===i+1&&p.name===(i?'chat':'editor')&&p.remaining===(i?2:5)&&p.state===(id===6?'BLOCKED':'READY')),'Preserve the process fields and change its state to '+(id===6?'BLOCKED.':'READY.'));break;
 case 8:expect(equal(results,[true,false,true,false]),'Only a free lock or the existing owner may be granted access.');break;
 case 9:expect(equal(results,[['disk','screen'],['disk','screen'],['a','m','z']]),'All processes must acquire resources in the same alphabetical order.');break;
 case 10:expect(results[0]?.hello==='welcome'&&results[0]?.note==='I built this.'&&results[1]?.a==='new'&&results[1]?.b==='two','Writing one file must preserve the others, and overwriting a name must replace its content.');break;
 case 11:expect(equal(results,[['run','editor','6'],['write','note','hello'],['pwd'],['ls'],['cd','..']]),'Trim the input and split on one or more whitespace characters.');break;
 }
 return true;
}
const api={lessons,callsFor,validate};root.Workshop=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
