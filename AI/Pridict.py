import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow import keras

# Load model đã lưu
model = keras.models.load_model("MedicalClassification.h5")


img_path = "bua5.png"

img = image.load_img(img_path, target_size=(128, 128))
img_array = image.img_to_array(img) / 255.0   
img_array = np.expand_dims(img_array, axis=0) 

pred = model.predict(img_array)
print(pred)
class_idx = np.argmax(pred, axis=1)[0]

print(" Model dự đoán lớp:", class_idx)
class_name = ['blood pressure monitor', 'cotton balls', 'infrared thermometer', 
              'medical gloves', 'medical mask', 'medical tape', 'medical tweezers', 
              'medicine cup', 'mercury thermometer', 'nebulizer mask', 
              'pulse oximeter', 'reflex hammer', 'stethoscope', 'surgical scissors']
vietnamess_name = {}
vietnamess_name["blood pressure monitor"] = "Máy đo huyết áp"
vietnamess_name["cotton balls"] = "Bông gòn"
vietnamess_name["infrared thermometer"] = "Nhiệt kế hồng ngoại"
vietnamess_name["medical gloves"] = "Găng tay y tế"
vietnamess_name["medical mask"] = "Khẩu trang y tế"
vietnamess_name["medical tape"] = "Băng y tế"
vietnamess_name["medical tweezers"] = "Nhíp y tế"
vietnamess_name["medicine cup"] = "Cốc đựng thuốc"
vietnamess_name["mercury thermometer"] = "Nhiệt kế thủy ngân"
vietnamess_name["nebulizer mask"] = "Mặt nạ phun sương"
vietnamess_name["pulse oximeter"] = "Máy đo oxy trong máu"
vietnamess_name["reflex hammer"] = "Búa cao su (búa phản xạ)"
vietnamess_name["stethoscope"] = "Ống nghe y tế"
vietnamess_name["surgical scissors"] = "Kéo phẩu thuật"

print(f"item name: {class_name[class_idx]}")
print(f"vietnamess name: {vietnamess_name[class_name[class_idx]]}")