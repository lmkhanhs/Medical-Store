import os
from PIL import Image
from pathlib import Path

# Các định dạng ảnh hợp lệ
VALID_EXTENSIONS = {".png", ".jpeg", ".bmp", ".webp", ".tif", ".tiff", ".gif", ".svg", ".jpg"}

def process_images(directory):
    error_files = []
    processed_count = 0
    skipped_count = 0

    # Kiểm tra thư mục có tồn tại không
    if not directory.exists() or not directory.is_dir():
        print(f"Thư mục '{directory}' không tồn tại hoặc không phải là thư mục hợp lệ.")
        return

    # Đếm tổng số file hợp lệ để xử lý
    total_files = sum(
        1 for _, _, files in os.walk(directory) for file in files
        if os.path.splitext(file)[1].lower() in VALID_EXTENSIONS
    )
    print(f"Tổng số file cần xử lý: {total_files}")

    # Duyệt qua tất cả các tệp trong thư mục
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            file_extension = os.path.splitext(file)[1].lower()

            # Bỏ qua các file không phải ảnh
            if file_extension not in VALID_EXTENSIONS:
                skipped_count += 1
                continue

            try:
                # Mở ảnh
                with Image.open(file_path) as img:
                    # Kiểm tra nếu ảnh đã ở dạng RGB
                    if img.mode == "RGB":
                        skipped_count += 1
                        continue

                    # Chuyển sang RGB
                    if img.mode == "P":
                        img = img.convert("RGBA")

                    if img.mode == "RGBA":
                        # Thêm nền trắng cho ảnh ARGB
                        background = Image.new("RGB", img.size, (255, 255, 255))
                        background.paste(img, mask=img.split()[3])  # 3 là kênh alpha
                        img = background
                    else:
                        img = img.convert("RGB")

                    # Ghi đè ảnh gốc
                    img.save(file_path)
                    processed_count += 1

            except Exception as e:
                # Ghi lại lỗi
                error_files.append((file_path, str(e)))

    # Báo cáo kết quả
    print("\nKẾT QUẢ XỬ LÝ:")
    print(f"- Số ảnh đã xử lý: {processed_count}")
    print(f"- Số ảnh đã bỏ qua: {skipped_count}")
    if error_files:
        print("- Số ảnh lỗi:")
        for file, error in error_files:
            print(f"  + {file}: {error}")
    else:
        print("- Không có ảnh lỗi.")

if __name__ == "__main__":
    print("📊 CHUYỂN ĐỔI ẢNH SANG RGB")
    print("=" * 35)

    # Nhập đường dẫn thư mục
    folder_path = input("Nhập đường dẫn thư mục: ").strip().strip('"').strip("'")
    if not folder_path:
        print("❌ Chưa nhập đường dẫn.")
    else:
        folder = Path(folder_path)
        process_images(folder)