import os
from fastapi import FastAPI, Request
from pydantic import BaseModel
from groq import Groq
import google.generativeai as genai
from mangum import Mangum

app = FastAPI()

# API Keys (Vercel Environment Variables ထဲမှာ ထည့်ရပါမယ်)
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# AI Clients Setup
groq_client = Groq(api_key=GROQ_API_KEY)
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

class ChatInput(BaseModel):
    message: str
    user_name: str = "Alex Thorne"

# --- LINGUISTIC REFINER SYSTEM PROMPT ---
MASTER_PROMPT = """
You are the CineMagic Master Architect. Your goal is to architect cinematic reality.
Rules:
1. If the user speaks in Burmese, use ELITE BURMESE. 
2. REMOVE all robotic formal markers like '၎င်း', 'သည်', 'ဖြစ်ပါသည်', 'ရှိပါသည်'.
3. USE natural, viral, and catchy Myanmar content creator tones (e.g., 'ဖြစ်သွားတာပါ', 'မိုက်တယ်', 'ဒီကားလေးက').
4. Be visionary, mysterious, and highly professional.
5. For video links, provide a structured Analysis Summary and 4K Production suggestions.
"""

@app.get("/api/health")
def health_check():
    return {"status": "CineMagic Engine Active", "version": "2.0"}

@app.post("/api/chat")
async def chat_endpoint(data: ChatInput):
    user_prompt = data.message
    
    # 1. Logic: Link ပါရင် Gemini နဲ့ အရင်စစ်၊ စာသားပဲဆိုရင် Groq နဲ့ပဲ သွားမယ် (Token Saving Strategy)
    if "http" in user_prompt:
        # Gemini Analysis for Links
        gemini_resp = gemini_model.generate_content(f"Analyze this content for CineMagic Studio: {user_prompt}")
        raw_analysis = gemini_resp.text
        
        # Pass raw analysis to Groq for Elite Myanmar Refinement
        refined_resp = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": MASTER_PROMPT},
                {"role": "user", "content": f"Refine this analysis into Elite Myanmar: {raw_analysis}"}
            ],
            model="llama3-8b-8192",
        )
        final_text = refined_resp.choices[0].message.content
        usage = {"model": "Gemini-Groq-Hybrid", "tokens": "Calculated"}
    else:
        # Direct Chat with Groq (Fast & Free)
        resp = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": MASTER_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model="llama3-8b-8192",
        )
        final_text = resp.choices[0].message.content
        # Owner Token Tracking (Simulated logic for now)
        usage = {"model": "Groq-Llama3", "input": len(user_prompt), "output": len(final_text)}

    return {
        "reply": final_text,
        "usage": usage,
        "architect_note": "Vision Decoded Successfully"
    }

# Vercel အတွက် Handler
handler = Mangum(app)
