from flask import Flask, request, jsonify
from PIL import Image
import Predict as predict
app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return "Flask API chạy rồi 🚀"
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "Không có file"}), 400

    file = request.files["file"]
    img = Image.open(file.stream)  

    # gọi model predict
    eng, vi, conf = predict.predict_image_pil(img)

    return jsonify({
        "english_name": eng,
        "vietnamese_name": vi,
        "confidence": conf
    })


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
