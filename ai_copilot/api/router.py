from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .health import router as health_router
from .chat import router as chat_router
from .voice import router as voice_router
from .multimodal import router as multimodal_router

app = FastAPI(
    title="Disaster Management AI Copilot API",
    version="0.1.0",
    description="Multimodal decision support and emergency orchestration engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(health_router, prefix="/api/v1", tags=["Health"])
app.include_router(chat_router, prefix="/api/v1", tags=["Chat"])
app.include_router(voice_router, prefix="/api/v1", tags=["Voice"])
app.include_router(multimodal_router, prefix="/api/v1", tags=["Multimodal"])

@app.get("/")
def root():
    return {"message": "Disaster Management AI Copilot is operational. Access docs at /docs."}
