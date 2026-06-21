/**
 * CineMagic Studio v53 - Final Master Logic
 * Focus: Dynamic Input, Multi-Agent Integration, Database Persistence
 */

let currentProjectId = null;

// --- 1. THEME & UI CONTROLS ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sb || !overlay) return;
    sb.classList.toggle('sidebar-closed');
    if (window.innerWidth < 1024) overlay.classList.toggle('hidden');
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        icon.className = 'fa-solid fa-sun text-sm';
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        icon.className = 'fa-solid fa-moon text-sm';
        localStorage.setItem('theme', 'dark');
    }
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.toggle('hidden');
}

// --- 2. DYNAMIC INPUT LOGIC (Line-Based) ---

function autoGrow(el) {
    const lineHeight = 24; // line-height နဲ့ ညှိထားသော pixel
    const maxLines = 5;
    const maxHeight = lineHeight * maxLines;

    el.style.height = "auto"; // အရင် reset လုပ်မယ်
    
    if (el.scrollHeight > maxHeight) {
        el.style.height = maxHeight + "px"; // 120px မှာ ရပ်မယ်
        el.style.overflowY = "auto"; // scroll ပေးမယ်
    } else {
        el.style.height = el.scrollHeight + "px"; // စာသားရှိသလောက် ကျယ်မယ်
        el.style.overflowY = "hidden"; // scroll ဖျောက်မယ်
    }
}

function handleKeyDown(event) {
    // Enter ခေါက်လျှင် စာပို့မည်၊ Shift + Enter ခေါက်လျှင် စာကြောင်းအသစ်ဆင်းမည်
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); 
        handleSend();
    }
}

// --- 3. CORE CHAT & PRODUCTION LOGIC ---
async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    const sendBtn = document.getElementById('sendBtn');
    const workspace = document.getElementById('workspace');
    const history = document.getElementById('chatHistory');

    if(!input || sendBtn.disabled) return;

    // A. User Message ကို Chat တွင် အရင်ပြမည်
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-8 animate-in fade-in";
    userMsg.innerHTML = `
        <div class="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap leading-relaxed">
            ${input}
        </div>`;
    history.appendChild(userMsg);

    // B. UI Reset (Input အမြင့်ကို စတင်ချိန်အတိုင်း ပြန်ထားမည်)
    inputEl.value = '';
    inputEl.style.height = "48px"; 
    sendBtn.disabled = true;
    workspace.scrollTop = workspace.scrollHeight;

    // C. Thinking Indicator (Compact Design)
    const thinkingMsg = document.createElement('div');
    thinkingMsg.className = "flex gap-6 items-start animate-in fade-in mb-8";
    thinkingMsg.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div>
        <div class="flex items-center gap-3 mt-2.5">
            <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] italic thinking-pulse">Architect is reasoning</span>
            <div class="flex gap-1 mb-0.5">
                <div class="w-1 h-1 bg-blue-500/60 rounded-full animate-bounce" style="animation-delay: -0.32s"></div>
                <div class="w-1 h-1 bg-blue-500/60 rounded-full animate-bounce" style="animation-delay: -0.16s"></div>
                <div class="w-1 h-1 bg-blue-500/60 rounded-full animate-bounce"></div>
            </div>
        </div>`;
    history.appendChild(thinkingMsg);
    workspace.scrollTop = workspace.scrollHeight;

    try {
        // D. Backend ဆီသို့ Vision ပေးပို့ခြင်း
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({
                'message': input, 
                'project_id': currentProjectId || ''
            }) 
        });
        const data = await response.json();
        currentProjectId = data.project_id; // Project ID ကို သိမ်းထားမည်
        
        // E. Thinking နေရာတွင် AI ၏ အဖြေအစစ်ကို အစားထိုးမည်
        thinkingMsg.innerHTML = `
            <div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs italic shrink-0 border border-blue-500/20 shadow-sm">⚡</div>
            <div class="space-y-2">
                <p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic text-left">${data.role_identity || 'Lead Producer'}</p>
                <p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p>
            </div>`;
        
        // F. Sidebar Library ကို Refresh လုပ်မည်
        loadSidebarArchives();

    } catch (e) {
        thinkingMsg.innerHTML = `<p class="text-xs text-red-500 p-2 text-left italic">Connection Offline. Check Engine Status.</p>`;
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
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-xs p-4 opacity-40 italic text-left">Archives Empty.</p>';
        }
    } catch (e) {
        console.log("Database sync unavailable.");
    }
}

// Sidebar က Project ကို နှိပ်လျှင် အရင် Chat တွေ ပြန်ခေါ်မည်
async function loadProjectHistory(id, title) {
    currentProjectId = id;
    document.getElementById('movieTitle').innerText = title;
    const history = document.getElementById('chatHistory');
    history.innerHTML = '<div class="text-xs p-10 opacity-50 italic text-center animate-pulse">Producer is restoring session...</div>';
    
    if (window.innerWidth < 1024) toggleSidebar(); // Mobile တွင် sidebar ပိတ်မည်

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
    } catch (e) {
        console.error("History retrieval failed.");
    }
}

// --- 5. VIDEO ENGINE CONTROLS ---
function startVideo() {
    const video = document.getElementById('videoPlayer');
    const poster = document.getElementById('poster');
    const playBtn = document.getElementById('playBtn');
    
    if (!video || !poster || !playBtn) return;

    // Demo Video Link (တကယ့် production တွင် AI ပေးသော link ဖြစ်မည်)
    video.src = "https://www.w3schools.com/html/mov_bbb.mp4"; 
    
    poster.classList.add('hidden');
    playBtn.classList.add('hidden');
    video.classList.remove('hidden');
    video.play();
}

// --- 6. INITIALIZATION ---
window.onload = () => {
    // Theme စစ်ဆေးခြင်း
    const savedTheme = localStorage.getItem('cinemagic-theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
    
    // Placeholder စာသားအသေထားခြင်း (v53 requirement)
    const inputEl = document.getElementById('userInput');
    if (inputEl) inputEl.placeholder = "Ask CineMagic or paste a link...";
    
    loadSidebarArchives();
};