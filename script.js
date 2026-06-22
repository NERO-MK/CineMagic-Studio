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

// --- Note *: MEDIA UPLOAD HANDLER ---
function handleMediaUpload(input) {
    if(input.files.length > 0) {
        alert(`${input.files.length} media files ingested. Architecting source integration...`);
    }
}

// --- CORE CHAT & SEND CONTROL ---
async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input) return;

    const sendBtn = document.getElementById('sendBtn');
    const sendIcon = document.getElementById('sendIcon');
    const history = document.getElementById('chatHistory');
    const workspace = document.getElementById('workspace');

    // 1. Lock UI & Disable Send
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";
    sendIcon.className = "fa-solid fa-spinner fa-spin";

    // 2. Append User Message (White Style)
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-10 animate-in fade-in";
    userMsg.innerHTML = `<div class="user-msg-bubble">${input}</div>`;
    history.appendChild(userMsg);
    workspace.scrollTop = workspace.scrollHeight;

    // 3. Append AI Thinking State
    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-10";
    thinking.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs shrink-0 shadow-lg">⚡</div>
        <div class="space-y-3 mt-2">
            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest thinking-pulse italic">Thinking...</p>
        </div>`;
    history.appendChild(thinking);
    workspace.scrollTop = workspace.scrollHeight;

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
        });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        // 4. Update AI Response
        thinking.innerHTML = `
            <div class="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs shrink-0 shadow-lg">⚡</div>
            <div class="space-y-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic text-left">Intelligence Core</p>
                <div class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</div>
            </div>`;
    } catch (e) {
        thinking.innerHTML = `<p class="text-xs text-red-500 p-2">Architect Link Offline.</p>`;
    } finally {
        // 5. Unlock UI
        sendBtn.disabled = false;
        sendBtn.style.opacity = "1";
        sendIcon.className = "fa-solid fa-arrow-up";
        workspace.scrollTop = workspace.scrollHeight;
    }
}

function startVideo() {
    const v = document.getElementById('videoPlayer');
    v.src = "https://www.w3schools.com/html/mov_bbb.mp4";
    document.getElementById('poster').classList.add('hidden');
    document.getElementById('playBtn').classList.add('hidden');
    v.classList.remove('hidden');
    v.play();
}

window.onload = () => { /* Sidebar init... */ };