/**
 * CineMagic Studio v54 - Professional Build
 * Feature: 5-Line Dynamic Input & Full System Integration
 */

let currentProjectId = null;

// --- 1. UI CONTROLS ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sb || !overlay) return;
    sb.classList.toggle('sidebar-closed');
    if (window.innerWidth < 1024) overlay.classList.toggle('hidden');
}

function toggleTheme() {
    // Permanent Light Theme Logic (v52 ညွှန်ကြားချက်အရ အမြဲလင်းနေမည်)
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.toggle('hidden');
}

// --- 2. DYNAMIC INPUT LOGIC (5-LINE LIMIT) ---
function autoGrow(el) {
    const lineHeight = 24; // စာတစ်ကြောင်း၏ အမြင့် (Pixel)
    const maxLines = 5;
    const maxHeight = lineHeight * maxLines;

    el.style.height = "48px"; // အရင်ဆုံး Minimum height ကို reset လုပ်သည်
    
    // စာရိုက်လိုက်သည့် အမြင့်သည် ၅ ကြောင်းစာ (120px) ထက် ကျော်မကျော် စစ်ဆေးသည်
    if (el.scrollHeight > maxHeight) {
        el.style.height = maxHeight + "px"; // 120px မှာပဲ ရပ်ထားမည်
        el.style.overflowY = "auto"; // Scroll ပေးမည်
    } else {
        el.style.height = (el.scrollHeight) + "px"; // စာသားရှိသလောက်ပဲ ကျယ်မည်
        el.style.overflowY = "hidden"; // Scroll ဖျောက်ထားမည်
    }
}

function handleKeyDown(event) {
    // Enter ခေါက်လျှင် စာပို့မည်၊ Shift + Enter ခေါက်လျှင် စာကြောင်းဆင်းမည်
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); 
        handleSend();
    }
}

// --- 3. CORE CHAT & PRODUCTION ENGINE ---
async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim(); // <--- ဒီနေရာက အရင်အတိုင်းပါပဲ
    const sendBtn = document.getElementById('sendBtn');
    const workspace = document.getElementById('workspace');
    const history = document.getElementById('chatHistory');

    // စာမရှိရင် သို့မဟုတ် ခလုတ်ပိတ်ထားရင် ဘာမှမလုပ်ပါ
    if(!input || sendBtn.disabled) return;

    // A. User Message Append
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-8 animate-in fade-in";
    userMsg.innerHTML = `
        <div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap leading-relaxed">
            ${input}
        </div>`;
    history.appendChild(userMsg);

    // B. UI Reset (Input အမြင့်ကို ၁ ကြောင်းစာ 48px ပြန်ချသည်)
    inputEl.value = '';
    inputEl.style.height = "48px"; 
    inputEl.style.overflowY = "hidden";
    sendBtn.disabled = true;
    workspace.scrollTop = workspace.scrollHeight;

    // C. Compact Thinking Indicator
    const thinkingMsg = document.createElement('div');
    thinkingMsg.className = "flex gap-6 items-start animate-in fade-in mb-8";
    thinkingMsg.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div>
        <div class="flex items-center gap-3 mt-2.5">
            <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] italic thinking-pulse">Lead Producer is thinking</span>
            <div class="flex gap-1 mb-0.5">
                <div class="w-1 h-1 bg-blue-500/60 rounded-full animate-bounce" style="animation-delay: -0.32s"></div>
                <div class="w-1 h-1 bg-blue-500/60 rounded-full animate-bounce" style="animation-delay: -0.16s"></div>
                <div class="w-1 h-1 bg-blue-500/60 rounded-full animate-bounce"></div>
            </div>
        </div>`;
    history.appendChild(thinkingMsg);
    workspace.scrollTop = workspace.scrollHeight;

    try {
        // D. Fetch from Railway Backend
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({
                'message': input, 
                'project_id': currentProjectId || ''
            }) 
        });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        // E. Replace Thinking with AI Response
        thinkingMsg.innerHTML = `
            <div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div>
            <div class="space-y-2">
                <p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic text-left">${data.role_identity || 'Lead Producer'}</p>
                <p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p>
            </div>`;
        
        loadSidebarArchives(); // Sidebar update

    } catch (e) {
        thinkingMsg.innerHTML = `<p class="text-xs text-red-500 p-2 text-left italic font-bold uppercase">Connection Offline. Engine Standby.</p>`;
    } finally {
        sendBtn.disabled = false;
        workspace.scrollTop = workspace.scrollHeight;
    }
}

// --- 4. DATABASE & ARCHIVE SYNC ---
async function loadSidebarArchives() {
    const container = document.getElementById('sidebarLibrary');
    if (!container) return;
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        if (projects && projects.length > 0) {
            container.innerHTML = projects.map(p => `
                <div onclick="loadProjectHistory('${p.id}', '${p.title}')" class="flex flex-col gap-1 px-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:border-primary transition-all text-left mb-3 shadow-sm group">
                    <div class="flex justify-between items-center">
                        <span class="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full w-max italic">Movie</span>
                        <span class="text-[8px] text-slate-400 italic">${new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-xs font-bold truncate text-slate-700">${p.title || 'Untitled Project'}</p>
                </div>`).join('');
        } else {
            container.innerHTML = '<p class="text-xs p-4 opacity-40 italic text-left">Library is empty.</p>';
        }
    } catch (e) { console.log("DB sync offline."); }
}

async function loadProjectHistory(id, title) {
    currentProjectId = id;
    document.getElementById('movieTitle').innerText = title;
    const history = document.getElementById('chatHistory');
    history.innerHTML = '<div class="text-xs p-10 opacity-50 italic text-center animate-pulse tracking-widest">Restoring production session...</div>';
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
    } catch (e) { console.error("Sync error."); }
}

// --- 5. VIDEO ENGINE ---
function startVideo() {
    const video = document.getElementById('videoPlayer');
    const poster = document.getElementById('poster');
    const playBtn = document.getElementById('playBtn');
    if (!video || !poster || !playBtn) return;
    video.src = "https://www.w3schools.com/html/mov_bbb.mp4"; 
    poster.classList.add('hidden');
    playBtn.classList.add('hidden');
    video.classList.remove('hidden');
    video.play();
}

// --- 6. BOOT ---
window.onload = () => {
    document.documentElement.classList.remove('dark'); // Force Light Theme
    const inputEl = document.getElementById('userInput');
    if (inputEl) inputEl.placeholder = "Ask CineMagic or paste a link...";
    loadSidebarArchives();
};