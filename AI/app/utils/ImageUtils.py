import os
import shutil
from fastapi import UploadFile

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def save_upload_file(file: UploadFile) -> str:
    """Lưu file upload và trả về đường dẫn"""
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


def delete_file(path: str):
    """Xoá file nếu tồn tại"""
    if os.path.exists(path):
        os.remove(path)


def validate_image(file: UploadFile):
    """Kiểm tra file có phải ảnh hay không"""
    if not file.content_type.startswith("image/"):
        return False
    return True
