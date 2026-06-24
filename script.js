let currentProjectId = null;

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('sidebar-closed'); }
function autoGrow(el) {
    el.style.height = "48px";
    if (el.scrollHeight > 120) { el.style.height = "120px"; el.style.overflowY = "auto"; }
    else { el.style.height = (el.scrollHeight) + "px"; el.style.overflowY = "hidden"; }
}

async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input) return;
    const sendBtn = document.getElementById('sendBtn');
    const history = document.getElementById('chatHistory');

    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;

    // User Message
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-10 animate-in fade-in";
    userMsg.innerHTML = `<div class="bg-white border border-slate-200 text-slate-800 px-8 py-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl font-medium text-left whitespace-pre-wrap">${input}</div>`;
    history.appendChild(userMsg);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    // Thinking Indicator
    const thinking = document.createElement('div');
    thinking.className = "flex gap-6 items-start animate-in fade-in mb-10";
    thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs shrink-0 shadow-lg italic">⚡</div><p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest animate-pulse mt-2.5 italic">Thinking...</p>`;
    history.appendChild(thinking);
    document.getElementById('workspace').scrollTop = document.getElementById('workspace').scrollHeight;

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: new URLSearchParams({'message': input, 'project_id': currentProjectId || ''}) 
        });
        const data = await response.json();
        document.getElementById('modelDisplay').innerText = data.model_used;
        
        thinking.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs shrink-0 shadow-lg italic">⚡</div><div class="space-y-4"><p class="text-[10px] font-bold uppercase tracking-widest text-blue-600 italic text-left">${data.role_identity}</p><p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p></div>`;
    } catch (e) { thinking.innerHTML = `<p class="text-xs text-red-500 p-2 text-left italic">Connection Offline.</p>`; }
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