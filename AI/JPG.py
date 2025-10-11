import os
from PIL import Image
from pathlib import Path

# Các định dạng ảnh hợp lệ để chuyển đổi
VALID_EXTENSIONS = {".png", ".jpeg", ".bmp", ".webp", ".tif", ".tiff", ".gif", ".svg"}

def convert_to_jpg(directory):
    error_files = []
    processed_count = 0
    skipped_count = 0

    # Kiểm tra thư mục có tồn tại không
    if not directory.exists() or not directory.is_dir():
        print(f"Thư mục '{directory}' không tồn tại hoặc không phải là thư mục hợp lệ.")
        return

    # Đếm tổng số file hợp lệ để xử lý
    total_files = 0
    for root, _, files in os.walk(directory):
        for file in files:
            file_extension = os.path.splitext(file)[1].lower()
            if file_extension in VALID_EXTENSIONS or file_extension == ".jpg":
                total_files += 1

    print(f"Tổng số file cần xử lý: {total_files}")

    # Duyệt qua tất cả các tệp trong thư mục
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            file_extension = os.path.splitext(file)[1].lower()

            # Bỏ qua các file đã là JPG
            if file_extension == ".jpg":
                skipped_count += 1
                continue

            # Chỉ xử lý các file hợp lệ
            if file_extension not in VALID_EXTENSIONS:
                skipped_count += 1
                continue

            try:
                # Mở ảnh và chuyển đổi sang JPG
                with Image.open(file_path) as img:
                    img = img.convert("RGB")  # Đảm bảo chuyển sang RGB trước khi lưu
                    new_file_path = os.path.splitext(file_path)[0] + ".jpg"
                    img.save(new_file_path, "JPEG")
                    processed_count += 1

                    # Xóa file gốc sau khi chuyển đổi thành công
                    os.remove(file_path)

            except Exception as e:
                # Ghi lại lỗi
                error_files.append((file_path, str(e)))

    # Báo cáo kết quả
    print("\nKẾT QUẢ XỬ LÝ:")
    print(f"- Số file đã chuyển đổi: {processed_count}")
    print(f"- Số file đã bỏ qua: {skipped_count}")
    if error_files:
        print("- Số file lỗi:")
        for file, error in error_files:
            print(f"  + {file}: {error}")
    else:
        print("- Không có file lỗi.")

if __name__ == "__main__":
    print("📊 CHUYỂN ĐỔI FILE SANG JPG")
    print("=" * 35)

    # Nhập đường dẫn thư mục
    folder_path = input("Nhập đường dẫn thư mục: ").strip().strip('"').strip("'")
    if not folder_path:
        print("❌ Chưa nhập đường dẫn.")
    else:
        folder = Path(folder_path)
        convert_to_jpg(folder)