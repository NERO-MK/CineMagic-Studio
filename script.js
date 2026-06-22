// script.js - Updated for v12.0 Ecosystem
let currentProjectId = null;
let selectedVoiceFile = null;

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('sidebar-closed'); }
function toggleSettings() { document.getElementById('settingsModal').classList.toggle('hidden'); }
function toggleActionMenu() { document.getElementById('actionMenu').classList.toggle('hidden'); }

function autoGrow(el) {
    el.style.height = "48px";
    if (el.scrollHeight > 120) { el.style.height = "120px"; el.style.overflowY = "auto"; }
    else { el.style.height = (el.scrollHeight) + "px"; el.style.overflowY = "hidden"; }
}

function handleVoiceUpload(input) {
    if(input.files && input.files[0]) { selectedVoiceFile = input.files[0]; alert("Producer Note: Lip-sync and voice data ingested."); }
}

async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input && !selectedVoiceFile) return;
    const sendBtn = document.getElementById('sendBtn');
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;

    const history = document.getElementById('chatHistory');
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-8 animate-in fade-in";
    userMsg.innerHTML = `<div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap">${input || "Processing Media Source..."}</div>`;
    history.appendChild(userMsg);

    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-8";
    thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div><p class="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse mt-2.5 italic thinking-pulse">Director is analyzing trends & VFX...</p>`;
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
        
        thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm italic text-[8px]">⚡</div><div class="space-y-4 flex-1 text-left"><p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic">${data.role_identity}</p><p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800">${data.reply.replace(/\n/g, '<br>')}</p><div class="pt-2"><button onclick="alert('Deducting 10 credits... VFX Bake started.')" class="px-6 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all">🔥 Bake Masterpiece</button></div></div>`;
        loadSidebarArchives();
    } catch (e) { thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left italic">Engine Offline.</p>`; }
    finally { sendBtn.disabled = false; document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight; }
}

async function loadSidebarArchives() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const container = document.getElementById('sidebarLibrary');
        if (projects.length > 0) {
            container.innerHTML = projects.map(p => `
                <div onclick="alert('Load Session')" class="flex flex-col gap-1 px-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:border-primary transition-all text-left mb-3 shadow-sm group">
                    <span class="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full w-max italic">Production</span>
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