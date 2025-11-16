from app.services.PredictService import predict_from_image

def handle_predict(image_path: str):
    """Controller chỉ gọi service và xử lý thêm nếu cần"""
    result = predict_from_image(image_path)
    return result
