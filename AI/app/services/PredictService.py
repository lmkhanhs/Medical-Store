import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow import keras

# Đường dẫn model
MODEL_PATH = os.path.join("model", "MedicalClassification.h5")

# Load model 1 lần duy nhất
model = keras.models.load_model(MODEL_PATH)

# Tên tiếng Anh
class_name = [
    'blood pressure monitor', 'cotton balls', 'infrared thermometer',
    'medical gloves', 'medical mask', 'medical tape', 'medical tweezers',
    'medicine cup', 'mercury thermometer', 'nebulizer mask',
    'pulse oximeter', 'reflex hammer', 'stethoscope', 'surgical scissors'
]

# Tên tiếng Việt
vietnamess_name = {
    "blood pressure monitor": "Máy đo huyết áp",
    "cotton balls": "Bông gòn",
    "infrared thermometer": "Nhiệt kế hồng ngoại",
    "medical gloves": "Găng tay y tế",
    "medical mask": "Khẩu trang y tế",
    "medical tape": "Băng y tế",
    "medical tweezers": "Nhíp y tế",
    "medicine cup": "Cốc đựng thuốc",
    "mercury thermometer": "Nhiệt kế thủy ngân",
    "nebulizer mask": "Mặt nạ phun sương",
    "pulse oximeter": "Máy đo oxy trong máu",
    "reflex hammer": "Búa phản xạ",
    "stethoscope": "Ống nghe y tế",
    "surgical scissors": "Kéo phẫu thuật"
}

def predict_from_image(img_path: str):
    """Dự đoán ảnh và trả kết quả"""

    img = image.load_img(img_path, target_size=(128, 128))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    pred = model.predict(img_array)
    class_idx = int(np.argmax(pred, axis=1)[0])

    english_name = class_name[class_idx]
    vietnamese_name = vietnamess_name[english_name]
    confidence = float(pred[0][class_idx] * 100)

    return {
        "class_index": class_idx,
        "name_en": english_name,
        "name_vi": vietnamese_name,
        "confidence": confidence
    }
