from fastapi import FastAPI
from app.routers.PredictRouter import router as predict_router

app = FastAPI()

app.include_router(predict_router)

@app.get("/")
def index():
    return {"message": "AI Prediction API Running"}

# VENV\Scripts\activate
# uvicorn app.main:app --reload

if __name__ == "__main__":
    import uvicorn 
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )