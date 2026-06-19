import os
import subprocess
import asyncio
import edge_tts
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeVideoClip, TextClip

class CineMagicEngine:
    def __init__(self, blueprint):
        self.blueprint = blueprint
        self.project_path = f"./temp/{blueprint['project_id']}"
        os.makedirs(self.project_path, exist_ok=True)

    async def download_source(self):
        print(f"📥 Downloading source: {self.blueprint['source_url']}")
        # yt-dlp သုံးပြီး server ပေါ်သို့ အမြန်ဆုံး ဆွဲယူခြင်း
        cmd = f"yt-dlp -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4' {self.blueprint['source_url']} -o {self.project_path}/source.mp4"
        subprocess.run(cmd, shell=True)

    async def generate_voiceover(self):
        print("🎙️ Generating Elite Myanmar Voiceover...")
        communicate = edge_tts.Communicate(self.blueprint['voiceover_script'], "my-MM-ThihaNeural") # မြန်မာအသံ
        await communicate.save(f"{self.project_path}/voiceover.mp3")

    def assemble_video(self):
        print("🎬 Assembling Final Masterpiece (FFmpeg Mode)...")
        source = VideoFileClip(f"{self.project_path}/source.mp4")
        
        # AI Blueprint အတိုင်း အခန်းများကို ဖြတ်ထုတ်ခြင်း
        clips = []
        for edit in self.blueprint['edits']:
            clip = source.subclip(edit['start'], edit['end'])
            clips.append(clip)
        
        final_clip = CompositeVideoClip(clips)
        
        # အသံဖိုင် (Voiceover) ပေါင်းစပ်ခြင်း
        audio = AudioFileClip(f"{self.project_path}/voiceover.mp3")
        final_video = final_clip.set_audio(audio)

        # 9:16 TikTok Format ပြောင်းလဲခြင်း
        if self.blueprint['output_format'] == "9:16":
            final_video = final_video.crop(x_center=final_video.w/2, y_center=final_video.h/2, width=final_video.h*9/16, height=final_video.h)

        # Render လုပ်ခြင်း (GPU ရှိလျှင် ပိုမြန်မည်)
        final_video.write_videofile(f"{self.project_path}/final_4k.mp4", fps=30, codec="libx264", audio_codec="aac")
        print("✅ Production Complete!")

# Execution Flow (Backend ကနေ ခေါ်ယူပုံ)
async def start_production(blueprint):
    engine = CineMagicEngine(blueprint)
    await engine.download_source()
    await engine.generate_voiceover()
    engine.assemble_video()