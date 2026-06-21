/**
 * CineMagic Studio v55 - Final Script Build
 */

let currentProjectId = null;

// --- UI CONTROLS ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sb.classList.toggle('sidebar-closed');
    if (window.innerWidth < 1024) overlay.classList.toggle('hidden');
}

// Note *: Auto-Grow with 5-line limit (120px)
function autoGrow(el) {
    el.style.height = "48px"; // Reset to single line height
    if (el.scrollHeight > 120) {
        el.style.height = "120px";
        el.style.overflowY = "auto";
    } else {
        el.style.height = (el.scrollHeight) + "px";
        el.style.overflowY = "hidden";
    }
}

// Note *: Disabling automatic send on Enter to allow new lines
// User must click the send button to submit.
function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    const sendBtn = document.getElementById('sendBtn');
    const sendIcon = document.getElementById('sendIcon');

    // Prevent empty or duplicate sends
    if(!input || sendBtn.disabled) return;

    const history = document.getElementById('chatHistory');
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-8 animate-in fade-in";
    userMsg.innerHTML = `<div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap leading-relaxed">${input}</div>`;
    history.appendChild(userMsg);

    // --- Note *: LOCK SEND BUTTON & UI ---
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.4";
    sendIcon.className = "fa-solid fa-spinner fa-spin text-lg";

    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-8";
    thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div><p class="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse mt-2 italic">Processing...</p>`;
    history.appendChild(thinking);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    // API Call
    fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
        method: 'POST', 
        body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
    })
    .then(res => res.json())
    .then(data => {
        currentProjectId = data.project_id;
        thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div><div class="space-y-2"><p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic">${data.role_identity}</p><p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p></div>`;
        loadSidebarArchives();
    })
    .catch(() => {
        thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left">Link Offline.</p>`;
    })
    .finally(() => {
        // --- Note *: RE-ENABLE SEND BUTTON ---
        sendBtn.disabled = false;
        sendBtn.style.opacity = "1";
        sendIcon.className = "fa-solid fa-arrow-up text-lg";
        document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;
    });
}

async function loadSidebarArchives() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const container = document.getElementById('sidebarLibrary');
        if (projects && projects.length > 0) {
            container.innerHTML = projects.map(p => `
                <div onclick="loadProjectHistory('${p.id}', '${p.title}')" class="flex flex-col gap-1 px-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:border-primary transition-all text-left mb-3 shadow-sm">
                    <span class="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full w-max italic">Archive</span>
                    <p class="text-xs font-bold truncate text-slate-700">${p.title || 'Untitled Project'}</p>
                </div>`).join('');
        }
    } catch (e) { console.log("Offline"); }
}

function startVideo() {
    const v = document.getElementById('videoPlayer');
    v.src = "https://www.w3schools.com/html/mov_bbb.mp4";
    document.getElementById('poster').classList.add('hidden');
    document.getElementById('playBtn').classList.add('hidden');
    v.classList.remove('hidden');
    v.play();
}

window.onload = () => {
    document.documentElement.classList.remove('dark');
    loadSidebarArchives();
};