let currentProjectId = null;

// --- THEME TOGGLE: Premium Transition ---
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

// --- SIDEBAR TOGGLE ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sb.classList.toggle('sidebar-closed');
    if (window.innerWidth < 1024) overlay.classList.toggle('hidden');
}

function autoGrow(el) { el.style.height = "5px"; el.style.height = (el.scrollHeight) + "px"; }
function toggleSettings() { document.getElementById('settingsModal').classList.toggle('hidden'); }

// --- DATABASE: Fetch Archives ---
async function loadSidebarArchives() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const container = document.getElementById('sidebarLibrary');
        if (projects && projects.length > 0) {
            container.innerHTML = projects.map(p => `
                <div onclick="loadProjectHistory('${p.id}', '${p.title}')" class="flex flex-col gap-1 px-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl cursor-pointer hover:border-primary transition-all text-left mb-3 group shadow-sm">
                    <div class="flex justify-between items-center">
                        <span class="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 rounded-full italic w-max">Movie</span>
                        <span class="text-[9px] text-slate-400 italic">${new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-xs font-bold truncate text-slate-700 dark:text-zinc-200">${p.title}</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-xs p-4 opacity-40 italic text-left">No archives in studio.</p>';
        }
    } catch (e) { console.log("Archive sync offline."); }
}

async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input) return;
    const sendBtn = document.getElementById('sendBtn');
    inputEl.value = '';
    sendBtn.disabled = true;

    const history = document.getElementById('chatHistory');
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-6 animate-in fade-in";
    userMsg.innerHTML = `<div class="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-4 rounded-[2rem] text-sm max-w-[85%] shadow-xl font-medium text-left">${input}</div>`;
    history.appendChild(userMsg);

    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-6";
    thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xs italic shrink-0 border border-primary/20 shadow-sm">⚡</div><p class="text-sm font-bold text-slate-400 uppercase tracking-widest thinking-pulse italic mt-2">Thinking...</p>`;
    history.appendChild(thinking);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
        });
        const data = await response.json();
        currentProjectId = data.project_id;
        
        thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xs italic shrink-0 border border-primary/20 shadow-sm">⚡</div><div class="space-y-2"><p class="text-[10px] font-bold uppercase tracking-widest text-primary italic">${data.role_identity}</p><p class="text-sm opacity-80 leading-relaxed font-medium text-slate-800 dark:text-slate-100 text-left">${data.reply.replace(/\n/g, '<br>')}</p></div>`;
        loadSidebarArchives();
    } catch (e) { thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left">Production link offline.</p>`; }
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

window.onload = () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') toggleTheme();
    loadSidebarArchives();
};