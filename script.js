/**
 * CineMagic Studio v58 - Final Production Logic
 * Lead Producer: AI Architect
 * Features: Dynamic Input, Voice Cloning, Swarm Intelligence, DB Persistence
 */

let currentProjectId = null;
let selectedVoiceFile = null;

// --- 1. INITIALIZATION ---
window.onload = () => {
    // Pure Light Theme အဖြစ် အမြဲတမ်း သတ်မှတ်ခြင်း
    document.documentElement.classList.remove('dark');
    
    // Sidebar Archives များကို Database မှ ဆွဲယူခြင်း
    loadSidebarArchives();
    
    // Input Placeholder ကို စတင်သတ်မှတ်ခြင်း
    const inputEl = document.getElementById('userInput');
    if (inputEl) inputEl.placeholder = "Describe your movie or paste a link...";
};

// --- 2. UI & THEME CONTROLS ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sb || !overlay) return;
    sb.classList.toggle('sidebar-closed');
    if (window.innerWidth < 1024) overlay.classList.toggle('hidden');
}

function toggleTheme() {
    // Lead Developer Note: ညွှန်ကြားချက်အရ Light Theme ကိုသာ ဦးစားပေးထားသည်
    alert("CineMagic is currently optimized for Platinum Light Theme.");
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.toggle('hidden');
}

// --- 3. DYNAMIC INPUT LOGIC (5-Line Limit) ---
function autoGrow(el) {
    const lineHeight = 24; 
    const maxLines = 5;
    const maxHeight = lineHeight * maxLines;

    el.style.height = "48px"; // Reset height
    if (el.scrollHeight > maxHeight) {
        el.style.height = maxHeight + "px";
        el.style.overflowY = "auto";
    } else {
        el.style.height = (el.scrollHeight) + "px";
        el.style.overflowY = "hidden";
    }
}

// Note *: Voice Sample Selection
function handleVoiceUpload(input) {
    if(input.files && input.files[0]) {
        selectedVoiceFile = input.files[0];
        alert("Voice Sample Loaded: " + selectedVoiceFile.name + ". Ready for cloning.");
    }
}

// --- 4. CORE CHAT & PRODUCTION ENGINE ---
async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    const sendBtn = document.getElementById('sendBtn');
    const sendIcon = document.getElementById('sendIcon');
    const history = document.getElementById('chatHistory');
    const workspace = document.getElementById('workspace');

    // Input သို့မဟုတ် ဖိုင် တစ်ခုခုပါမှ အလုပ်လုပ်မည်
    if((!input && !selectedVoiceFile) || sendBtn.disabled) return;

    // A. User UI Update
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-8 animate-in fade-in";
    const displayMsg = input || "Voice Sample Uploaded for Cloning";
    userMsg.innerHTML = `<div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap leading-relaxed">${displayMsg}</div>`;
    history.appendChild(userMsg);

    // B. Prep UI State & LOCK Send Button
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.4";
    sendIcon.className = "fa-solid fa-spinner fa-spin text-lg";
    workspace.scrollTop = workspace.scrollHeight;

    // C. Thinking Indicator (Compact)
    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-8";
    thinking.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div>
        <div class="flex items-center gap-3 mt-2.5">
            <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest thinking-pulse italic">Lead Producer is thinking</span>
            <div class="flex gap-1 mb-0.5">
                <div class="w-1 h-1 bg-blue-500/60 rounded-full animate-bounce" style="animation-delay:-0.3s"></div>
                <div class="w-1 h-1 bg-blue-500/60 rounded-full animate-bounce" style="animation-delay:-0.15s"></div>
                <div class="w-1 h-1 bg-blue-500/60 rounded-full animate-bounce"></div>
            </div>
        </div>`;
    history.appendChild(thinking);
    workspace.scrollTop = workspace.scrollHeight;

    try {
        // D. Data Preparation (Multipart for Voice Files)
        const formData = new FormData();
        formData.append('message', input || "Process voice sample");
        formData.append('project_id', currentProjectId || '');
        if (selectedVoiceFile) {
            formData.append('file', selectedVoiceFile);
        }

        // E. API Call to Railway Backend
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: formData 
        });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        // F. Replace Thinking with AI Masterpiece Blueprint
        thinking.innerHTML = `
            <div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div>
            <div class="space-y-2">
                <p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic">${data.role_identity}</p>
                <p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p>
            </div>`;
        
        selectedVoiceFile = null; // Reset voice file after send
        loadSidebarArchives(); // Update Sidebar

    } catch (e) {
        thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left italic font-bold">PRODUCTION LINK OFFLINE.</p>`;
    } finally {
        sendBtn.disabled = false;
        sendBtn.style.opacity = "1";
        sendIcon.className = "fa-solid fa-arrow-up text-lg";
        workspace.scrollTop = workspace.scrollHeight;
    }
}

// --- 5. DATABASE ARCHIVE SYNC ---
async function loadSidebarArchives() {
    const container = document.getElementById('sidebarLibrary');
    if (!container) return;
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        if (projects && projects.length > 0) {
            container.innerHTML = projects.map(p => `
                <div onclick="loadProjectHistory('${p.id}', '${p.title}')" class="flex flex-col gap-1 px-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:border-primary transition-all text-left mb-3 shadow-sm group">
                    <span class="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full w-max italic">${p.style || 'Movie'}</span>
                    <p class="text-xs font-bold truncate text-slate-700">${p.title || 'Untitled Production'}</p>
                </div>`).join('');
        } else {
            container.innerHTML = '<p class="text-xs p-4 opacity-40 italic text-left">No archives found.</p>';
        }
    } catch (e) { console.log("Database offline."); }
}

async function loadProjectHistory(id, title) {
    currentProjectId = id;
    document.getElementById('movieTitle').innerText = title;
    const history = document.getElementById('chatHistory');
    history.innerHTML = '<div class="text-xs p-10 opacity-50 italic text-center animate-pulse tracking-widest uppercase">Restoring Session Intelligence...</div>';
    if (window.innerWidth < 1024) toggleSidebar();

    try {
        const res = await fetch(`/api/chats/${id}`);
        const chats = await res.json();
        history.innerHTML = '';
        chats.forEach(c => {
            const bubble = document.createElement('div');
            if (c.role === 'user') {
                bubble.className = "flex justify-end mb-8 animate-in fade-in";
                bubble.innerHTML = `<div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap">${c.content}</div>`;
            } else {
                bubble.className = "flex gap-6 items-start animate-in fade-in mb-8";
                bubble.innerHTML = `
                    <div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div>
                    <div class="space-y-2">
                        <p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic text-left">${c.role_identity || 'Lead Producer'}</p>
                        <p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${c.content.replace(/\n/g, '<br>')}</p>
                    </div>`;
            }
            history.appendChild(bubble);
        });
        document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;
    } catch (e) { console.error("History sync error."); }
}

// --- 6. VIDEO PLAYER CONTROL ---
function startVideo() {
    const video = document.getElementById('videoPlayer');
    const poster = document.getElementById('poster');
    const playBtn = document.getElementById('playBtn');
    if (!video || !poster || !playBtn) return;

    // Example Demo Video (AI က ပေးသော URL ကို ဤနေရာတွင် အစားထိုးမည်)
    video.src = "https://www.w3schools.com/html/mov_bbb.mp4"; 
    poster.classList.add('hidden');
    playBtn.classList.add('hidden');
    video.classList.remove('hidden');
    video.play();
}