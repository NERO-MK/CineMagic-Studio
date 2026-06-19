import os
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from mangum import Mangum

app = FastAPI()

# --- CORS SETTINGS (အရေးကြီးသည်) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel domain ကို ခွင့်ပြုရန်
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

@app.post("/api/chat")
async def chat(message: str = Form(None)):
    if not message:
        return {"reply": "Master Architect Status: Awaiting your vision."}
    
    if not GROQ_API_KEY:
        return {"reply": "Backend Error: GROQ_API_KEY is not set on Railway."}

    try:
        client = Groq(api_key=GROQ_API_KEY)
        # Model နာမည်ကို Stable ဖြစ်သော llama-3.1-8b-instant သို့မဟုတ် llama-3.3-70b-versatile သုံးပါ
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=[
                {"role": "system", "content": "You are CineMagic Master Architect. Speak in Elite Burmese."},
                {"role": "user", "content": message}
            ]
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Architecture Intel Error: {str(e)}"}

@app.get("/")
def health():
    return {"status": "CineMagic Engine Online"}

handler = Mangum(app)