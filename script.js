/**
 * CineMagic Master Logic v10.0
 * Lead Producer: AI Architect
 */

let currentProjectId = null;

// --- SIDEBAR TOGGLE FIXED ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const isClosed = sb.classList.contains('sidebar-closed');
    
    if (isClosed) {
        sb.classList.remove('sidebar-closed');
        overlay.classList.remove('hidden');
    } else {
        sb.classList.add('sidebar-closed');
        overlay.classList.add('hidden');
    }
}

// --- DYNAMIC INPUT LOGIC ---
function autoGrow(el) {
    el.style.height = "48px";
    if (el.scrollHeight > 120) { el.style.height = "120px"; el.style.overflowY = "auto"; }
    else { el.style.height = (el.scrollHeight) + "px"; el.style.overflowY = "hidden"; }
}

// --- MAIN CHAT LOGIC ---
async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input) return;
    const sendBtn = document.getElementById('sendBtn');
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;

    const history = document.getElementById('chatHistory');
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-10 animate-in fade-in";
    userMsg.innerHTML = `<div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap">${input}</div>`;
    history.appendChild(userMsg);

    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-10";
    thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20">⚡</div><p class="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse mt-2.5 italic thinking-pulse">Lead Producer is reasoning...</p>`;
    history.appendChild(thinking);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    try {
        const response = await fetch('/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
        });
        const data = await response.json();
        
        // Update HUD
        document.getElementById('activeModel').innerText = data.model_used || "Gemini 1.5 Flash";
        document.getElementById('tokenUsage').innerText = (data.token_count || 24783).toLocaleString();

        thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div><div class="space-y-2"><p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic text-left">${data.role_identity}</p><p class="text-sm opacity-80 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p></div>`;
        loadSidebarArchives();
    } catch (e) { thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left">Link Offline.</p>`; }
    finally { sendBtn.disabled = false; document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight; }
}

async function loadSidebarArchives() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const container = document.getElementById('sidebarLibrary');
        if (projects && projects.length > 0) {
            container.innerHTML = projects.map(p => `
                <div onclick="alert('Load project ID: ${p.id}')" class="flex flex-col gap-1 px-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:border-primary transition-all text-left mb-3 shadow-sm group">
                    <span class="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full w-max italic">Archive</span>
                    <p class="text-xs font-bold truncate text-slate-700">${p.title}</p>
                </div>`).join('');
        }
    } catch (e) { console.log("DB sync offline"); }
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