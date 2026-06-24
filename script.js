let currentProjectId = null;

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sb.classList.toggle('sidebar-closed');
    if (window.innerWidth < 1024) overlay.classList.toggle('hidden');
}

function autoGrow(el) {
    el.style.height = "48px";
    if (el.scrollHeight > 120) { el.style.height = "120px"; el.style.overflowY = "auto"; }
    else { el.style.height = (el.scrollHeight) + "px"; el.style.overflowY = "hidden"; }
}

function handleFileUpload(input) { if(input.files.length > 0) alert(`${input.files.length} sources loaded.`); }

async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input) return;
    const sendBtn = document.getElementById('sendBtn');
    const sendIcon = document.getElementById('sendIcon');
    const history = document.getElementById('chatHistory');

    // 1. Lock UI & Disable Button
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;
    sendIcon.className = "fa-solid fa-circle-notch animate-spin";

    // 2. Append User Message
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-8 animate-in fade-in";
    userMsg.innerHTML = `<div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap">${input}</div>`;
    history.appendChild(userMsg);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    // 3. Thinking Indicator
    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-8";
    thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div><p class="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse mt-2.5 italic">Reasoning through 2.5 Flash Swarm...</p>`;
    history.appendChild(thinking);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
        });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        // 4. Update AI Response
        thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div><div class="space-y-4"><p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic text-left">${data.role_identity}</p><p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p></div>`;
        loadSidebarArchives();
    } catch (e) { thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left italic">Connection failure.</p>`; }
    finally { sendBtn.disabled = false; sendIcon.className = "fa-solid fa-arrow-up"; document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight; }
}

async function loadSidebarArchives() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const container = document.getElementById('sidebarLibrary');
        if (projects.length > 0) {
            container.innerHTML = projects.map(p => `<div class="flex flex-col gap-1 px-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:border-primary transition-all text-left mb-3 shadow-sm group"><span class="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full w-max italic">Archive</span><p class="text-xs font-bold truncate text-slate-700">${p.title}</p></div>`).join('');
        }
    } catch (e) { console.log("DB offline"); }
}

function startVideo() {
    const v = document.getElementById('videoPlayer');
    v.src = "https://www.w3schools.com/html/mov_bbb.mp4";
    document.getElementById('poster').classList.add('hidden');
    document.getElementById('playBtn').classList.add('hidden');
    v.classList.remove('hidden');
    v.play();
}

window.onload = () => { loadSidebarArchives(); };