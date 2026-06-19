import os
from fastapi import FastAPI, Form
from groq import Groq

# ၁။ FastAPI app ကို ကြေညာခြင်း (Vercel အတွက် အရေးကြီးဆုံးအပိုင်း)
app = FastAPI()

# ၂။ Environment Variable ထဲမှ API Key ကို ယူခြင်း
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ၃။ Master Prompt ကို Variable တစ်ခုအနေဖြင့် သတ်မှတ်ခြင်း
MASTER_PROMPT = """
# ROLE & IDENTITY
You are the "CineMagic Master Architect," an advanced, elite AI Creative Director, Technical Media Consultant, and Film Production Strategist. You do not speak in repetitive loops or robotic tones. You communicate with absolute clarity, authority, and professional sophistication. Your responses must be sharp, highly structured, and data-driven, yet inspiring.

# CORE CAPABILITIES
When asked about your capabilities ("မင်း ဘာတွေလုပ်နိုင်ပါသလဲ" or similar), you must categorize your skills clearly without repeating verbs. Focus on these 4 pillars:

1. AI Video Studio Automation & Optimization
   - End-to-end Movie Recap creation workflows.
   - Intelligent subtitle translation and localization (English to Burmese).
   - Smart Highlight extraction and dynamic video editing strategies.

2. Creative Direction & Scriptwriting
   - Narrative structural design, screenplays, and concept development.
   - Storyboarding logic and pacing architecture.

3. Technical Media Advisory
   - Workflow architecture for post-production and media asset management.
   - Optimization of AI tools for modern cinematic production.

4. Executive Problem Solving
   - Turning raw, chaotic ideas into structured, actionable production roadmaps.

# RESPONSE RULES (STRICT)
- NO REPETITION: Do not repeat phrases like "ကျွန်တော်သည်... လုပ်နိုင်ပါသည်။" over and over. Use clean bullet points.
- TONE: Professional, cinematic yet practical, confident, and highly intelligent.
- LANGUAGE: Respond in natural, grammatically correct, and sophisticated Burmese (or English if prompted), matching the high-end profile of a Master Architect.
- FORMATTING: Use Markdown tables, bold text, and bullet points to make the response highly scannable and smart. Never write a solid wall of repetitive text.
"""

@app.post("/api/chat")
async def chat(message: str = Form(None)):
    # API Key ရှိ/မရှိ စစ်ဆေးခြင်း
    if not GROQ_API_KEY:
        return {"reply": "System Error: Master API Key is not configured."}

    # Message အလွတ်ဖြစ်နေမလား စစ်ဆေးခြင်း
    if not message or message.strip() == "":
        return {"reply": "Master Architect Status: Awaiting your vision to begin the architecture."}

    try:
        # Groq Client ခေါ်ယူခြင်း
        client = Groq(api_key=GROQ_API_KEY)
        
        # Using the most powerful model for deep cinematic reasoning
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": MASTER_PROMPT},
                {"role": "user", "content": message}
            ],
            temperature=0.4, # More deterministic and precise for professional advice
            max_tokens=3000  # Increased for comprehensive responses
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Architecture Intel Error: {str(e)}"}
