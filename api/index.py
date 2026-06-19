import os
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from google import genai 
from mangum import Mangum

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

groq_client = Groq(api_key=GROQ_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# လမ်းကြောင်းကို /api/chat လို့ တိုက်ရိုက်ပေးထားပါ
@app.post("/api/chat")
async def chat(message: str = Form(...)):
    try:
        context_text = message
        if "http" in message and gemini_client:
            gemini_response = gemini_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=f"Analyze this content for a movie studio: {message}"
            )
            context_text = f"Source Analysis: {gemini_response.text}\n\nUser Request: {message}"

        completion = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are CineMagic Master Architect. Speak in Elite Burmese."},
                {"role": "user", "content": context_text}
            ]
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Error: {str(e)}"}

# Root check အတွက် (optional)
@app.get("/api/chat")
def health():
    return {"status": "CineMagic API is Online"}

handler = Mangum(app)
