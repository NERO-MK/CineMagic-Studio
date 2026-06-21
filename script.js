let currentProjectId = null;
let selectedVoiceFile = null;

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

function handleVoiceUpload(input) {
    if(input.files && input.files[0]) { selectedVoiceFile = input.files[0]; alert("Voice Sample Loaded."); }
}

async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input && !selectedVoiceFile) return;
    const sendBtn = document.getElementById('sendBtn');
    
    // User UI
    const history = document.getElementById('chatHistory');
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-8 animate-in fade-in";
    userMsg.innerHTML = `<div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap">${input || "Cloning Voice..."}</div>`;
    history.appendChild(userMsg);

    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;

    // Thinking
    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-8";
    thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm italic text-[8px]">⚡</div><p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest animate-pulse mt-2.5 italic thinking-pulse">Producer is reasoning...</p>`;
    history.appendChild(thinking);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    try {
        const formData = new FormData();
        formData.append('message', input);
        formData.append('project_id', currentProjectId || '');
        if (selectedVoiceFile) formData.append('file', selectedVoiceFile);

        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { method: 'POST', body: formData });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm text-[8px]">⚡</div><div class="space-y-2"><p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic text-left">${data.role_identity}</p><p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p></div>`;
        loadSidebarArchives();
    } catch (e) { thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left italic">Connection Offline.</p>`; }
    finally { sendBtn.disabled = false; document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight; }
}

async function loadSidebarArchives() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const container = document.getElementById('sidebarLibrary');
        if (projects.length > 0) {
            container.innerHTML = projects.map(p => `
                <div onclick="alert('Restore session ID: ${p.id}')" class="flex flex-col gap-1 px-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:border-primary transition-all text-left mb-3 shadow-sm group">
                    <span class="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full w-max italic">${p.style || 'Archive'}</span>
                    <p class="text-xs font-bold truncate text-slate-700">${p.title}</p>
                </div>`).join('');
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