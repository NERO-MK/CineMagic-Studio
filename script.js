let currentProjectId = null;
let selectedFile = null;

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('sidebar-closed'); }

function autoGrow(el) {
    el.style.height = "48px";
    if (el.scrollHeight > 120) { el.style.height = "120px"; el.style.overflowY = "auto"; }
    else { el.style.height = (el.scrollHeight) + "px"; el.style.overflowY = "hidden"; }
}

// Note *: Handling File Selection
function handleFileChange(input) {
    if(input.files && input.files[0]) {
        selectedFile = input.files[0];
        document.getElementById('uploadBtn').innerHTML = `<i class="fa-solid fa-file-circle-check text-blue-600 text-xl"></i>`;
        alert(`File Ready: ${selectedFile.name}`);
    }
}

async function handleSend() {
    const inputEl = document.getElementById('userInput');
    const input = inputEl.value.trim();
    if(!input && !selectedFile) return;

    const sendBtn = document.getElementById('sendBtn');
    const sendIcon = document.getElementById('sendIcon');
    const history = document.getElementById('chatHistory');

    // Note *: 1. Disable Send Button immediately
    inputEl.value = '';
    inputEl.style.height = "48px";
    sendBtn.disabled = true;
    sendIcon.className = "fa-solid fa-spinner fa-spin";

    // 2. Append User Message
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end mb-10 animate-in fade-in";
    const displayMsg = selectedFile ? `${input} <br><small class="opacity-50">[File: ${selectedFile.name}]</small>` : input;
    userMsg.innerHTML = `<div class="user-msg-bubble">${displayMsg}</div>`;
    history.appendChild(userMsg);
    history.parentElement.scrollTop = history.parentElement.scrollHeight;

    // 3. Thinking Indicator
    const thinking = document.createElement('div');
    thinking.className = "flex gap-4 items-center animate-in fade-in mb-10";
    thinking.innerHTML = `
        <div class="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center text-zinc-500 text-[8px] font-bold italic shrink-0">⚡</div>
        <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest thinking-pulse italic">Thinking...</span>`;
    history.appendChild(thinking);

    // 4. Data Preparation (FormData for Uploads)
    const formData = new FormData();
    formData.append('message', input || "Process uploaded file");
    if(selectedFile) formData.append('file', selectedFile);

    try {
        const response = await fetch('https://cinemagic-engine-production.up.railway.app/api/chat', { 
            method: 'POST', 
            body: formData 
        });
        const data = await response.json();
        
        // 5. AI Response
        thinking.className = "flex gap-6 items-start animate-in fade-in mb-10";
        thinking.innerHTML = `
            <div class="w-8 h-8 rounded bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 italic">⚡</div>
            <div class="space-y-4">
                <p class="text-sm opacity-90 leading-relaxed font-medium text-slate-800 text-left">${data.reply.replace(/\n/g, '<br>')}</p>
            </div>`;
    } catch (e) {
        thinking.innerHTML = `<p class="text-xs text-red-500 p-2 italic">Error: Connection lost.</p>`;
    } finally {
        // 6. Reset UI and Enable Send Button
        sendBtn.disabled = false;
        sendIcon.className = "fa-solid fa-arrow-up";
        selectedFile = null;
        document.getElementById('uploadBtn').innerHTML = `<i class="fa-solid fa-circle-plus text-xl"></i>`;
        history.parentElement.scrollTop = history.parentElement.scrollHeight;
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