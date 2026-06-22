/**
 * CineMagic Studio v6.0 - Intelligence Core
 */

let currentProjectId = null;
let isRecording = false;

// --- SIDEBAR ---
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

function toggleActionMenu() { document.getElementById('actionMenu').classList.toggle('hidden'); }

// --- Note *: MEDIA & VOICE UPLOAD ---
function handleFileUpload(input) {
    if(input.files.length > 0) {
        alert(`${input.files.length} files selected. Ready to upload to Cloud Factory.`);
    }
}

function toggleVoice() {
    isRecording = !isRecording;
    const mic = document.getElementById('micBtn');
    if (isRecording) {
        mic.classList.add('text-red-600', 'animate-pulse');
        alert("Voice Recording Active. I am listening to your vision...");
    } else {
        mic.classList.remove('text-red-600', 'animate-pulse');
    }
}

// --- Note *: SMART CHAT FLOW ---
async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input) return;
    const sendBtn = document.getElementById('sendBtn');
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true; // Disable on send

    // A. User Message (White Theme as requested)
    const history = document.getElementById('chatHistory');
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-10 animate-in fade-in";
    userMsg.innerHTML = `<div class="user-bubble">${input}</div>`;
    history.appendChild(userMsg);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    // B. AI Thinking Indicator with "Thought" process
    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-10";
    thinking.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs shrink-0 shadow-lg">⚡</div>
        <div class="space-y-3 mt-2">
            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest thinking-pulse italic">CineMagic is thinking...</p>
            <div id="thought-process" class="text-[10px] text-slate-400 italic">Processing vision parameters...</div>
        </div>`;
    history.appendChild(thinking);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
        });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        // C. Final AI Response (Professional and Data-Driven)
        thinking.innerHTML = `
            <div class="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs shrink-0 shadow-lg">⚡</div>
            <div class="space-y-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic text-left">Intelligence Core</p>
                <div class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</div>
            </div>`;
    } catch (e) { thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left">Link Offline. Engine is in Standby.</p>`; }
    finally { sendBtn.disabled = false; document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight; }
}

function startVideo() {
    const v = document.getElementById('videoPlayer');
    v.src = "https://www.w3schools.com/html/mov_bbb.mp4";
    document.getElementById('poster').classList.add('hidden');
    document.getElementById('playBtn').classList.add('hidden');
    v.classList.remove('hidden');
    v.play();
}

function showFAQ() {
    alert("CineMagic Guide:\n1. Provide link or script.\n2. AI will architect the blueprint.\n3. One-click sync to TikTok, YT, FB.");
}

window.onload = () => { /* Initialization logic */ };