// --- THEME & SIDEBAR TOGGLE ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('sidebar-closed');
    if (window.innerWidth < 1024) overlay.classList.toggle('hidden');
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    html.classList.toggle('dark');
    icon.className = html.classList.contains('dark') ? 'fa-solid fa-moon text-xs' : 'fa-solid fa-sun text-xs';
}

function toggleSettings() { document.getElementById('settingsModal').classList.toggle('hidden'); }
function autoGrow(el) { el.style.height = "5px"; el.style.height = (el.scrollHeight) + "px"; }

// --- CORE CHAT & THINKING LOGIC ---
async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    const sendBtn = document.getElementById('sendBtn');
    const sendIcon = document.getElementById('sendIcon');
    const history = document.getElementById('chatHistory');
    const workspace = document.getElementById('workspace');

    if(!input || sendBtn.disabled) return;

    // Append User Message
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end animate-in fade-in slide-in-from-bottom-2 mb-4";
    userMsg.innerHTML = `<div class="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-5 rounded-[22px] text-sm max-w-[85%] shadow-lg font-medium">${input}</div>`;
    history.appendChild(userMsg);

    // Prep UI State
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    sendIcon.className = "fa-solid fa-spinner fa-spin text-lg";

    // Thinking Indicator
    const thinkingMsg = document.createElement('div');
    thinkingMsg.className = "p-7 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[28px] flex gap-5 shadow-sm mb-4";
    thinkingMsg.innerHTML = `
        <div class="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-[10px] italic shrink-0 shadow-inner border border-accent/20">⚡</div>
        <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest thinking-pulse italic">Thinking...</span>
            <span class="flex gap-1">
                <span class="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span class="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span class="w-1 h-1 bg-accent rounded-full animate-bounce"></span>
            </span>
        </div>`;
    history.appendChild(thinkingMsg);
    workspace.scrollTop = workspace.scrollHeight;

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'message': input })
        });
        const data = await response.json();
        
        // Replace Thinking with Result
        thinkingMsg.innerHTML = `
            <div class="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0 italic shadow-inner border border-zinc-200 dark:border-zinc-800">⚡</div>
            <div class="space-y-1">
                <p class="text-[10px] font-black text-accent uppercase tracking-widest text-left">Lead Producer</p>
                <p class="text-sm opacity-80 leading-relaxed font-medium text-left text-zinc-800 dark:text-zinc-100">${data.reply.replace(/\n/g, '<br>')}</p>
            </div>`;
    } catch (e) {
        thinkingMsg.innerHTML = `<p class="text-xs text-red-500 p-2 italic text-left text-center">Engine Connection Offline.</p>`;
    } finally {
        sendBtn.disabled = false;
        sendIcon.className = "fa-solid fa-arrow-up text-lg";
        workspace.scrollTop = workspace.scrollHeight;
    }
}

// --- VIDEO PLAYER ---
function startVideo() {
    const video = document.getElementById('videoPlayer');
    video.src = "https://www.w3schools.com/html/mov_bbb.mp4";
    document.getElementById('poster').classList.add('hidden');
    document.getElementById('playBtn').classList.add('hidden');
    video.classList.remove('hidden');
    video.play();
}