from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from googletrans import Translator, LANGUAGES
import database

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

translator = Translator()

# Dependency to get database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "auto"
    target_lang: str

@app.get("/languages")
def get_languages():
    return [{"code": code, "name": name.capitalize()} for code, name in LANGUAGES.items()]

@app.post("/translate")
def translate_text(req: TranslationRequest, db: Session = Depends(get_db)):
    try:
        if not req.text.strip():
            return {"translated_text": "", "source_lang": req.source_lang}
            
        # Perform translation
        # If source_lang is 'auto', it will auto-detect
        src = req.source_lang if req.source_lang != "auto" else "auto"
        result = translator.translate(req.text, src=src, dest=req.target_lang)
        
        # Save to history
        detected_src = result.src if req.source_lang == "auto" else req.source_lang
        
        history_item = database.TranslationHistory(
            source_lang=detected_src,
            target_lang=req.target_lang,
            source_text=req.text,
            translated_text=result.text
        )
        db.add(history_item)
        db.commit()
        
        return {
            "translated_text": result.text,
            "source_lang": detected_src,
            "target_lang": req.target_lang
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    history = db.query(database.TranslationHistory).order_by(database.TranslationHistory.created_at.desc()).limit(50).all()
    return history
