/**
 * CineMagic Studio v64 - Final Master Logic
 */

let currentProjectId = null;
let currentTokens = 15000; // Default initial point for demo

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

// --- Note *: DYNAMIC TOKEN DISPLAY LOGIC ---
function updateTokenHUD(amount) {
    currentTokens = amount;
    // Format number with commas for elite look (e.g., 14,783)
    document.getElementById('tokenTrack').innerText = amount.toLocaleString() + " Tokens";
}

async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input) return;

    const sendBtn = document.getElementById('sendBtn');
    const sendIcon = document.getElementById('sendIcon');
    const history = document.getElementById('chatHistory');
    const workspace = document.getElementById('workspace');

    // 1. LOCK UI & DISABLE SEND
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";
    sendIcon.className = "fa-solid fa-circle-notch animate-spin";

    // User Message (White Style)
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-10 animate-in fade-in";
    userMsg.innerHTML = `<div class="user-bubble">${input}</div>`;
    history.appendChild(userMsg);
    workspace.scrollTop = workspace.scrollHeight;

    // AI Thinking State
    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-10";
    thinking.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs shrink-0 shadow-lg italic">⚡</div>
        <p class="text-sm font-bold text-slate-400 uppercase tracking-widest thinking-pulse mt-2.5 italic">Reasoning...</p>`;
    history.appendChild(thinking);
    workspace.scrollTop = workspace.scrollHeight;

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
        });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        // --- Note *: Update Token Balance from AI Response ---
        if(data.tokens_remaining) updateTokenHUD(data.tokens_remaining);

        thinking.innerHTML = `
            <div class="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs shrink-0 shadow-lg italic">⚡</div>
            <div class="space-y-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic">CineMagic Response</p>
                <p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p>
            </div>`;
    } catch (e) {
        thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left italic">Connection Offline.</p>`;
    } finally {
        sendBtn.disabled = false;
        sendBtn.style.opacity = "1";
        sendIcon.className = "fa-solid fa-arrow-up";
        workspace.scrollTop = workspace.scrollHeight;
    }
}

// Initial Sync
window.onload = () => { updateTokenHUD(); };