from fastapi import APIRouter, UploadFile, File
import os
import shutil
from app.controllers.PredictController import handle_predict

router = APIRouter(prefix="/api/predict")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/")
async def predict_api(file: UploadFile = File(...)):
    # Lưu file tạm
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Gọi controller
    result = handle_predict(file_path)

    # Nếu muốn xoá file sau khi predict
    # os.remove(file_path)

    return result
