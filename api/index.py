import os
import sys

# Error debugging အတွက်: Vercel logs မှာ ပေါ်လာအောင်
try:
    import google.generativeai as genai
    from groq import Groq
    from fastapi import FastAPI, Form
    from fastapi.middleware.cors import CORSMiddleware
    from mangum import Mangum
except ImportError as e:
    print(f"Import Error detected: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_KEY = os.environ.get("GROQ_API_KEY")

@app.get("/api/chat")
def health():
    return {"status": "online", "python_version": sys.version}

@app.post("/api/chat")
async def chat(message: str = Form(...)):
    if not GROQ_KEY:
        return {"reply": "Configuration Error: API Key is missing."}

    try:
        # လက်ရှိတွင် Groq ကို အဓိက သုံး၍ ပြန်ကြားပေးမည်
        client = Groq(api_key=GROQ_KEY)
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are CineMagic Master Architect. Speak in Elite Burmese. Be professional."},
                {"role": "user", "content": message}
            ]
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Processing Error: {str(e)}"}

handler = Mangum(app)
