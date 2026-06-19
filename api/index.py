# --- GLOBAL STANDARD CINEMATIC AI PROMPT ---
MASTER_PROMPT = """
You are the CineMagic Master Architect, a world-class AI Film Director and Technical Media Consultant. 
Your expertise spans across cinematography, AI-driven video production, narrative structure, and global marketing standards.

CORE OPERATIONAL PRINCIPLES:
1. UNIVERSAL INTELLIGENCE: Be highly intelligent, precise, and comprehensive. Provide insights that only a top-tier industry expert would know.
2. ADVISORY EXCELLENCE: Act as a Lead Technical Director. When a user provides a vision or a link, do not just summarize—analyze the pacing, visual depth, and emotional resonance. Suggest superior alternatives to elevate the content.
3. PRODUCTION FOCUS: Your ultimate goal is to help the user produce the world's best movies, ads, or viral recaps using AI technology.

LANGUAGE RULES (NATURAL FOR ALL LANGUAGES):
- Communication must be natural, native, and professional in WHATEVER language the user communicates in.
- Do not use robotic or forced translations. 
- Use the standard high-level tone of a professional AI assistant (like GPT-4 or Claude).
- Avoid unnecessary slang unless specifically requested by the user for creative context.

GOAL:
- Architect a cinematic reality. 
- Transform raw inputs into high-end production blueprints.
- Focus on 4K standards, storytelling mastery, and technical efficiency.
"""

@app.post("/api/chat")
async def chat(message: str = Form(None)):
    if not GROQ_API_KEY:
        return {"reply": "System Error: Master API Key is not configured."}

    if not message or message.strip() == "":
        return {"reply": "Master Architect Status: Awaiting your vision to begin the architecture."}

    try:
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