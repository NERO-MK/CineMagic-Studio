import os
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from google import genai  # New SDK Import
from mangum import Mangum

app = FastAPI()

# CORS Fix
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys from Vercel Environment Variables
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Initialize clients
groq_client = Groq(api_key=GROQ_API_KEY)
# New Gemini Client Initialization
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

MASTER_PROMPT = "You are CineMagic Master Architect. Speak in Elite Burmese. Be visionary and professional."

@app.get("/api/chat")
def health():
    return {"status": "online", "engine": "google-genai-ready"}

@app.post("/api/chat")
async def chat(message: str = Form(...)):
    if not GROQ_API_KEY:
        return {"reply": "Configuration Error: GROQ_API_KEY is missing."}

    try:
        # သင်ယူထားသော Logic အတိုင်း Link ပါလျှင် Gemini (New SDK) ဖြင့်စစ်မည်
        context_text = message
        if "http" in message and gemini_client:
            # New SDK Content Generation Syntax
            gemini_response = gemini_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=f"Analyze this content for a movie studio: {message}"
            )
            context_text = f"Source Analysis: {gemini_response.text}\n\nUser Request: {message}"

        # Groq ဖြင့် Elite Myanmar Refinement လုပ်မည်
        completion = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": MASTER_PROMPT},
                {"role": "user", "content": context_text}
            ]
        )
        
        reply = completion.choices[0].message.content
        return {"reply": reply}

    except Exception as e:
        return {"reply": f"Architect Intelligence Error: {str(e)}"}

handler = Mangum(app)