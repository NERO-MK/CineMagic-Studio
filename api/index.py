import os
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from mangum import Mangum

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key အား Environment မှ ရယူခြင်း
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

@app.post("/api/chat")
async def chat(message: str = Form(None)):
    if not message or message.strip() == "":
        return {"reply": "Architect Note: Vision is required to proceed with architecture."}

    if not GROQ_API_KEY:
        return {"reply": "System Error: Master API Key is not configured."}

    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        # MODEL UPDATE: Llama 3.3 70B (Latest & Powerful)
        # အကယ်၍ 70B က နှေးနေလျှင် 'llama-3.1-8b-instant' သို့ ပြောင်းနိုင်ပါသည်
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system", 
                    "content": "You are CineMagic Master Architec. Be mysterious, visionary, and professional."
                },
                {"role": "user", "content": message}
            ],
            temperature=0.6,
            max_tokens=2048
        )
        
        return {"reply": completion.choices[0].message.content}

    except Exception as e:
        # Error အသေးစိတ်ကို ပြန်လည်စစ်ဆေးရန်
        return {"reply": f"Architecture Logic Error: {str(e)}"}

handler = Mangum(app)