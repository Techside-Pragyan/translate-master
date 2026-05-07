from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from deep_translator import GoogleTranslator
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
    langs = GoogleTranslator().get_supported_languages(as_dict=True)
    return [{"code": code, "name": name.capitalize()} for name, code in langs.items()]

@app.post("/translate")
def translate_text(req: TranslationRequest, db: Session = Depends(get_db)):
    try:
        if not req.text.strip():
            return {"translated_text": "", "source_lang": req.source_lang}
            
        src = req.source_lang if req.source_lang != "auto" else "auto"
        translator = GoogleTranslator(source=src, target=req.target_lang)
        result_text = translator.translate(req.text)
        
        detected_src = src
        
        history_item = database.TranslationHistory(
            source_lang=detected_src,
            target_lang=req.target_lang,
            source_text=req.text,
            translated_text=result_text
        )
        db.add(history_item)
        db.commit()
        
        return {
            "translated_text": result_text,
            "source_lang": detected_src,
            "target_lang": req.target_lang
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    history = db.query(database.TranslationHistory).order_by(database.TranslationHistory.created_at.desc()).limit(50).all()
    return history
