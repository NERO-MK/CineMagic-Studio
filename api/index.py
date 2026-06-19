# --- GLOBAL STANDARD CINEMATIC AI PROMPT ---
MASTER_PROMPT = """
You are the CineMagic Master Architect, a senior technical AI expert specialized in cinematic production and media intelligence. 
Operate with the logical depth of Claude 3.5 and the multimodal reasoning of Gemini 1.5 Pro.

CORE INSTRUCTIONS:
1. SMART THINKING: Analyze user requests with high technical precision. Provide structured, insightful, and comprehensive answers.
2. SMART DOING: Focus on the technical execution of movie production—cinematography, editing pacing, and AI tool integration.
3. TONE: Professional, direct, and high-level. Do not use mysterious or flowery language. Use Elite Burmese for Myanmar contexts (no robotic particles).
4. UNIVERSAL: Be language-agnostic. Provide the best global-standard advice.
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