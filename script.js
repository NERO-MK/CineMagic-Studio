/**
 * CineMagic Master Logic v10.1
 * Features: Send Button Disable, Pill Input Fix
 */

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

function toggleSettings() { alert('Settings logic soon.'); }

async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input) return;

    const sendBtn = document.getElementById('sendBtn');
    const sendIcon = document.getElementById('sendIcon');
    const history = document.getElementById('chatHistory');
    const workspace = document.getElementById('workspace');

    // 1. Note *: DISABLE BUTTON & LOCK UI
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true; // Strict Disable
    sendIcon.className = "fa-solid fa-spinner fa-spin"; // Visual Feedback

    // 2. User Message UI
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-10 animate-in fade-in";
    userMsg.innerHTML = `<div class="bg-white border border-slate-200 text-slate-800 px-8 py-4 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap">${input}</div>`;
    history.appendChild(userMsg);
    workspace.scrollTop = workspace.scrollHeight;

    // 3. Thinking Animation
    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-10";
    thinking.innerHTML = `
        <div class="w-8 h-8 rounded bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 italic">⚡</div>
        <p class="text-sm font-bold text-slate-400 uppercase tracking-widest thinking-pulse mt-2 italic">Architect is thinking...</p>`;
    history.appendChild(thinking);
    workspace.scrollTop = workspace.scrollHeight;

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
        });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        // 4. Final Response Injection
        thinking.innerHTML = `
            <div class="w-8 h-8 rounded bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 italic">⚡</div>
            <div class="space-y-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic text-left">${data.role_identity}</p>
                <div class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</div>
            </div>`;
    } catch (e) {
        thinking.innerHTML = `<p class="text-xs text-red-500 p-2 italic text-left">Connection Error.</p>`;
    } finally {
        // 5. Note *: RE-ENABLE BUTTON
        sendBtn.disabled = false;
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

window.onload = () => { /* Load Archives Logic */ };