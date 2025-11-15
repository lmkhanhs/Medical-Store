from fastapi import FastAPI
from app.routers.PredictRouter import router as predict_router

app = FastAPI()

app.include_router(predict_router)

@app.get("/")
def index():
    return {"message": "AI Prediction API Running"}

# VENV\Scripts\activate
# uvicorn app.main:app --reload