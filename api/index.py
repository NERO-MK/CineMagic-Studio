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

# API Key ကို ပတ်ဝန်းကျင်မှ ဆွဲယူမည်
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

@app.post("/api/chat")
async def chat(message: str = Form(None)):
    # 1. Validation: စာသားပါမလာရင် Error ပြန်မယ်
    if not message or message.strip() == "":
        return {"reply": "Architect Note: Please provide a vision to decode."}

    if not GROQ_API_KEY:
        return {"reply": "System Error: API Key missing in environment."}

    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        # 2. Model Name ကို တိတိကျကျ သတ်မှတ်ပါ (llama3-8b-8192 is stable)
        completion = client.chat.completions.create(
            model="llama3-8b-8192", 
            messages=[
                {"role": "system", "content": "You are CineMagic Master Architect. Speak in Elite Burmese."},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=1024
        )
        
        return {"reply": completion.choices[0].message.content}

    except Exception as e:
        # Error အသေးစိတ်ကို Vercel Log မှာ ကြည့်နိုင်အောင် print ထုတ်ထားပါမယ်
        print(f"Groq API Error: {str(e)}")
        return {"reply": f"Architecture Logic Error: {str(e)}"}

handler = Mangum(app)