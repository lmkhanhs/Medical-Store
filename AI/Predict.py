import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow import keras

# Load model h5
model = keras.models.load_model("MedicalClassification.h5")

# Danh sách class
class_name = [
    'blood pressure monitor', 'cotton balls', 'infrared thermometer',
    'medical gloves', 'medical mask', 'medical tape', 'medical tweezers',
    'medicine cup', 'mercury thermometer', 'nebulizer mask',
    'pulse oximeter', 'reflex hammer', 'stethoscope', 'surgical scissors'
]

# Mapping tiếng Việt
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
    "reflex hammer": "Búa cao su (búa phản xạ)",
    "stethoscope": "Ống nghe y tế",
    "surgical scissors": "Kéo phẫu thuật"
}

def predict_image_pil(pil_img):
    """
    Hàm nhận vào 1 ảnh kiểu PIL.Image và trả kết quả dự đoán
    """
    # Resize và chuẩn hóa
    img = pil_img.resize((128, 128))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Dự đoán
    pred = model.predict(img_array)
    class_idx = np.argmax(pred, axis=1)[0]

    eng_name = class_name[class_idx]
    vi_name = vietnamess_name[eng_name]

    return eng_name, vi_name, float(np.max(pred))
