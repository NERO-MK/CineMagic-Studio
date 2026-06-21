// Note *: Track the current project to append chats correctly
let currentProjectId = null;

// --- THEME & SIDEBAR ---
function toggleSidebar() { 
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sb.classList.toggle('sidebar-closed');
    overlay.classList.toggle('hidden');
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    html.classList.toggle('dark');
    icon.className = html.classList.contains('dark') ? 'fa-solid fa-moon text-xs' : 'fa-solid fa-sun text-xs';
}

function toggleSettings() { document.getElementById('settingsModal').classList.toggle('hidden'); }
function autoGrow(el) { el.style.height = "5px"; el.style.height = (el.scrollHeight) + "px"; }

// --- Note *: ARCHIVE & CATEGORY SYSTEM ---
async function loadSidebarArchives() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const container = document.getElementById('sidebarLibrary');
        
        if (projects.length > 0) {
            container.innerHTML = projects.map(p => `
                <div onclick="loadProjectHistory('${p.id}', '${p.title}')" class="flex flex-col gap-1 px-3 py-3 bg-zinc-50 dark:bg-zincDark border border-zinc-100 dark:border-zinc-800 rounded-lg cursor-pointer hover:border-accent transition text-left group">
                    <div class="flex justify-between items-center">
                        <span class="text-[8px] font-black text-accent uppercase bg-accent/5 px-1.5 rounded italic">${p.style || 'Media'}</span>
                        <span class="text-[8px] opacity-40 italic">${new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-[11px] font-bold truncate dark:text-zinc-200 text-zinc-700">${p.title}</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-[10px] p-2 opacity-50 italic text-left">Archives Empty</p>';
        }
    } catch (e) { console.log("Archive sync failed."); }
}

// --- Note *: CHAT HISTORY RETRIEVAL ---
async function loadProjectHistory(id, title) {
    currentProjectId = id;
    document.getElementById('movieTitle').innerText = title;
    const history = document.getElementById('chatHistory');
    history.innerHTML = '<p class="text-xs p-10 opacity-50 italic text-center">Producer is restoring session...</p>';
    if(window.innerWidth < 1024) toggleSidebar();

    try {
        const res = await fetch(`/api/chats/${id}`);
        const chats = await res.json();
        history.innerHTML = '';
        chats.forEach(c => {
            const bubble = document.createElement('div');
            bubble.className = c.role === 'user' ? "flex justify-end fade-in mb-4" : "p-7 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[28px] flex gap-5 shadow-sm mb-4";
            bubble.innerHTML = c.role === 'user' 
                ? `<div class="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-4 rounded-[20px] text-sm max-w-[85%] font-medium shadow-md text-left">${c.content}</div>` 
                : `<div class="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0 italic border border-zinc-200 dark:border-zinc-800 shadow-inner">⚡</div><div class="space-y-1"><p class="text-[10px] font-black text-accent uppercase tracking-widest text-left">${c.role_identity || 'Lead Producer'}</p><p class="text-sm opacity-80 leading-relaxed font-medium text-left">${c.content.replace(/\n/g, '<br>')}</p></div>`;
            history.appendChild(bubble);
        });
        document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;
    } catch (e) { console.log(e); }
}

// --- Note *: MAIN SEND LOGIC ---
async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    const sendBtn = document.getElementById('sendBtn');
    if(!input || sendBtn.disabled) return;

    const history = document.getElementById('chatHistory');
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end fade-in mb-4";
    userMsg.innerHTML = `<div class="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-4 rounded-[18px] text-sm max-w-[85%] shadow-md font-medium text-left">${input}</div>`;
    history.appendChild(userMsg);

    inputEl.value = '';
    sendBtn.disabled = true;

    const thinking = document.createElement('div');
    thinking.className = "p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex gap-3 shadow-sm fade-in mb-4";
    thinking.innerHTML = `<div class="w-6 h-6 rounded bg-accent/10 flex items-center justify-center text-accent text-[8px] italic shrink-0 shadow-inner border border-accent/20">⚡</div><span class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest thinking-pulse italic">CineMagic is thinking...</span>`;
    history.appendChild(thinking);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
        });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        thinking.className = "p-7 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[28px] flex gap-5 shadow-sm mb-4";
        thinking.innerHTML = `<div class="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0 italic shadow-inner border border-zinc-200 dark:border-zinc-800">⚡</div><div class="space-y-1"><p class="text-[10px] font-black text-accent uppercase tracking-widest text-left">${data.role_identity}</p><p class="text-sm opacity-80 leading-relaxed font-medium text-left text-zinc-800 dark:text-zinc-100">${data.reply.replace(/\n/g, '<br>')}</p></div>`;
        loadSidebarArchives();
    } catch (e) { thinking.innerHTML = `<p class="text-xs text-red-500 p-2 italic text-left">Production link offline.</p>`; }
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

window.onload = () => { loadSidebarArchives(); };