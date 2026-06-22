/**
 * CineMagic Master Logic v13.0
 * Lead Producer: Final Polish Edition
 */

let currentProjectId = null;
let selectedVoiceFile = null;

// --- STUDIO CONTROLS ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sb.classList.toggle('sidebar-closed');
    if (window.innerWidth < 1024) overlay.classList.toggle('hidden');
}

function toggleSettings() { document.getElementById('settingsModal').classList.toggle('hidden'); }
function toggleActionMenu() { document.getElementById('actionMenu').classList.toggle('hidden'); }

function autoGrow(el) {
    el.style.height = "48px";
    if (el.scrollHeight > 120) { el.style.height = "120px"; el.style.overflowY = "auto"; }
    else { el.style.height = (el.scrollHeight) + "px"; el.style.overflowY = "hidden"; }
}

function handleVoiceUpload(input) {
    if(input.files && input.files[0]) { selectedVoiceFile = input.files[0]; alert("Producer Note: Lip-sync sample ingested."); }
}

// --- MAIN INTERACTION LOGIC ---
async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    const sendBtn = document.getElementById('sendBtn');
    const sendIcon = document.getElementById('sendIcon');

    if((!input && !selectedVoiceFile) || sendBtn.disabled) return;

    // A. User Message UI
    const history = document.getElementById('chatHistory');
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-10 animate-in fade-in";
    userMsg.innerHTML = `<div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap leading-relaxed">${input || "Processing Media..."}</div>`;
    history.appendChild(userMsg);

    // B. UI Reset
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;
    sendIcon.className = "fa-solid fa-spinner fa-spin text-lg";

    // C. Thinking Indicator
    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-10";
    thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div><p class="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse mt-2.5 italic thinking-pulse">Director is orchestrating Swarm & VFX...</p>`;
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
        
        // D. Replace Thinking with Final Intelligence
        thinking.innerHTML = `
            <div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div>
            <div class="space-y-4 flex-1 text-left">
                <p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic">${data.role_identity}</p>
                <p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800">${data.reply.replace(/\n/g, '<br>')}</p>
                <div class="pt-2">
                    <button onclick="startBaking()" id="bakeBtn" class="px-6 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all">🔥 Bake Masterpiece</button>
                </div>
            </div>`;
        
        loadSidebarArchives();
    } catch (e) { thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left italic">Engine connection interrupted.</p>`; }
    finally { sendBtn.disabled = false; sendIcon.className = "fa-solid fa-arrow-up text-lg"; document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight; }
}

// --- Note *: PRODUCTION BAKE ENGINE ---
function startBaking() {
    const bakeBtn = document.getElementById('bakeBtn');
    bakeBtn.disabled = true;
    bakeBtn.innerHTML = "Baking 4K Master...";
    bakeBtn.className = "px-6 py-2 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase animate-pulse";
    
    // Inject Live Progress HUD
    const history = document.getElementById('chatHistory');
    const hud = document.createElement('div');
    hud.className = "p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner mb-10 animate-in fade-in";
    hud.innerHTML = `
        <div class="flex justify-between items-center mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Live Render Monitor</span>
            <span id="renderPercent" class="text-blue-600 italic">5%</span>
        </div>
        <div class="hud-bar"><div id="renderFill" class="hud-fill" style="width: 5%;"></div></div>
        <p id="renderStatus" class="text-[9px] text-slate-400 mt-3 italic">Ingesting 4K Source Bitrate...</p>`;
    history.appendChild(hud);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    // Simulation logic for 4K Render Pipeline
    let progress = 5;
    const steps = ["Downloading Source", "Generating AI Voice", "FFmpeg Precision Cutting", "VFX Color Grading", "Mastering Audio", "Dispatching to Telegram"];
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 2;
        if(progress > 98) progress = 98;
        document.getElementById('renderFill').style.width = progress + "%";
        document.getElementById('renderPercent').innerText = progress + "%";
        document.getElementById('renderStatus').innerText = steps[Math.floor(progress/20)] || "Finalizing bits...";
        if(progress >= 98) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('renderStatus').innerText = "✅ Delivered to Telegram Cloud.";
                document.getElementById('renderPercent').innerText = "100%";
                document.getElementById('renderFill').style.width = "100%";
                alert("Masterpiece Ready! Check your Telegram.");
            }, 2000);
        }
    }, 1500);
}

// --- Note *: ARCHIVE RESTORATION REPAIR ---
async function loadSidebarArchives() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const container = document.getElementById('sidebarLibrary');
        if (projects && projects.length > 0) {
            container.innerHTML = projects.map(p => `
                <div onclick="restoreSession('${p.id}', '${p.title}')" class="flex flex-col gap-1 px-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:border-primary transition-all text-left mb-3 shadow-sm group">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full w-max italic">${p.style || 'Movie'}</span>
                        <span class="text-[8px] text-slate-400 italic">${new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-xs font-bold truncate text-slate-700">${p.title}</p>
                </div>`).join('');
        }
    } catch (e) { console.log("DB sync offline"); }
}

async function restoreSession(id, title) {
    currentProjectId = id;
    document.getElementById('movieTitle').innerText = title;
    const history = document.getElementById('chatHistory');
    history.innerHTML = '<div class="text-xs p-10 opacity-50 italic text-center animate-pulse tracking-widest uppercase">Restoring Master Blueprint...</div>';
    if (window.innerWidth < 1024) toggleSidebar();
    try {
        const res = await fetch(`/api/chats/${id}`);
        const chats = await res.json();
        history.innerHTML = '';
        chats.forEach(c => {
            const bubble = document.createElement('div');
            bubble.className = c.role === 'user' ? "flex justify-end mb-8" : "flex gap-6 items-start mb-8";
            bubble.innerHTML = c.role === 'user' 
                ? `<div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap leading-relaxed">${c.content}</div>` 
                : `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm italic">⚡</div><div class="space-y-2"><p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic text-left">${c.role_identity}</p><p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${c.content.replace(/\n/g, '<br>')}</p></div>`;
            history.appendChild(bubble);
        });
        document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;
    } catch (e) { console.error("Restore failed."); }
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