import os
import argparse
import shutil
from pathlib import Path
from PIL import Image
import imagehash
from collections import defaultdict
import numpy as np
from tqdm import tqdm

def compute_image_hash(img_path, hash_size=8, hash_method='phash'):
    """
    Tính toán perceptual hash cho một ảnh
    
    Tham số:
        img_path (str): Đường dẫn đến file ảnh
        hash_size (int): Kích thước hash (mặc định là 8)
        hash_method (str): Phương pháp hash ('phash', 'dhash', 'ahash', 'whash')
        
    Trả về:
        imagehash.ImageHash: Hash của ảnh
    """
    try:
        img = Image.open(img_path)
        if hash_method == 'phash':
            return imagehash.phash(img, hash_size=hash_size)
        elif hash_method == 'dhash':
            return imagehash.dhash(img, hash_size=hash_size)
        elif hash_method == 'ahash':
            return imagehash.average_hash(img, hash_size=hash_size)
        elif hash_method == 'whash':
            return imagehash.whash(img, hash_size=hash_size)
        else:
            return imagehash.phash(img, hash_size=hash_size)
    except Exception as e:
        print(f"Lỗi khi xử lý ảnh {img_path}: {str(e)}")
        return None

def find_similar_images(directory, similarity_threshold=5, hash_size=8, hash_method='phash', min_files_in_dir=5):
    """
    Tìm các ảnh tương tự trong thư mục
    
    Tham số:
        directory (str): Thư mục chứa ảnh
        similarity_threshold (int): Ngưỡng tương tự (càng thấp càng nghiêm ngặt)
        hash_size (int): Kích thước hash
        hash_method (str): Phương pháp hash
        min_files_in_dir (int): Số lượng file tối thiểu trong thư mục để thực hiện kiểm tra
        
    Trả về:
        list: Danh sách các nhóm ảnh tương tự
    """
    dir_path = Path(directory)
    if not dir_path.exists() or not dir_path.is_dir():
        print(f"Thư mục '{directory}' không tồn tại hoặc không phải là thư mục.")
        return []
    
    # Tìm tất cả các thư mục con
    subdirs = [d for d in dir_path.iterdir() if d.is_dir()]
    
    # Nếu không có thư mục con, xử lý trực tiếp thư mục hiện tại
    if not subdirs:
        subdirs = [dir_path]
    
    all_similar_groups = []
    
    for subdir in subdirs:
        # Lấy danh sách các file ảnh
        image_files = [
            f for f in subdir.glob('**/*') 
            if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp', '.webp']
        ]
        
        # Bỏ qua thư mục nếu có quá ít ảnh
        if len(image_files) < min_files_in_dir:
            print(f"Bỏ qua thư mục {subdir} vì chỉ có {len(image_files)} ảnh (cần tối thiểu {min_files_in_dir})")
            continue
        
        print(f"Đang xử lý thư mục {subdir} với {len(image_files)} ảnh...")
        
        # Tính hash cho tất cả ảnh
        image_hashes = {}
        for img_path in tqdm(image_files, desc="Tính hash cho ảnh"):
            img_hash = compute_image_hash(img_path, hash_size, hash_method)
            if img_hash is not None:
                image_hashes[img_path] = img_hash
        
        # Tìm các ảnh tương tự
        similar_images = []
        processed = set()
        
        hash_list = list(image_hashes.items())
        for i in tqdm(range(len(hash_list)), desc="So sánh các ảnh"):
            if hash_list[i][0] in processed:
                continue
                
            img_path_i, hash_i = hash_list[i]
            current_group = [img_path_i]
            processed.add(img_path_i)
            
            for j in range(i+1, len(hash_list)):
                img_path_j, hash_j = hash_list[j]
                if img_path_j in processed:
                    continue
                    
                # Tính khoảng cách giữa hai hash
                distance = hash_i - hash_j
                
                if distance <= similarity_threshold:
                    current_group.append(img_path_j)
                    processed.add(img_path_j)
            
            if len(current_group) > 1:
                similar_images.append(current_group)
        
        all_similar_groups.extend(similar_images)
    
    return all_similar_groups

def move_duplicates_to_folder(similar_groups, output_dir="duplicates"):
    """
    Di chuyển các ảnh trùng lặp (giữ lại một ảnh gốc) vào thư mục riêng
    
    Tham số:
        similar_groups (list): Danh sách các nhóm ảnh tương tự
        output_dir (str): Thư mục đầu ra cho các ảnh trùng lặp
    """
    if not similar_groups:
        print("Không tìm thấy ảnh trùng lặp.")
        return
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    moved_count = 0
    for i, group in enumerate(similar_groups):
        # Giữ lại ảnh đầu tiên trong mỗi nhóm
        kept_image = group[0]
        print(f"\nNhóm {i+1}: Giữ lại {kept_image}")
        
        # Di chuyển các ảnh khác vào thư mục duplicates
        for duplicate in group[1:]:
            dest_dir = output_path / f"group_{i+1}"
            dest_dir.mkdir(exist_ok=True)
            
            # Tạo đường dẫn đích để lưu file
            dest_file = dest_dir / duplicate.name
            
            print(f"  Di chuyển {duplicate} -> {dest_file}")
            try:
                shutil.copy2(duplicate, dest_file)  # Copy ảnh
                os.remove(duplicate)  # Xóa ảnh gốc
                moved_count += 1
            except Exception as e:
                print(f"  Lỗi khi di chuyển {duplicate}: {str(e)}")
    
    print(f"\nĐã di chuyển {moved_count} ảnh trùng lặp vào thư mục {output_dir}")
    print(f"Đã phát hiện và xử lý {len(similar_groups)} nhóm ảnh tương tự.")

def print_image_stats(similar_groups):
    """
    In thống kê về các nhóm ảnh tương tự
    """
    if not similar_groups:
        print("Không tìm thấy ảnh trùng lặp.")
        return
    
    total_groups = len(similar_groups)
    group_sizes = [len(group) for group in similar_groups]
    total_duplicates = sum(group_sizes) - total_groups
    
    print("\nTHỐNG KÊ:")
    print(f"- Tổng số nhóm ảnh tương tự: {total_groups}")
    print(f"- Tổng số ảnh trùng lặp cần xử lý: {total_duplicates}")
    print(f"- Kích thước trung bình của mỗi nhóm: {sum(group_sizes)/total_groups:.1f}")
    print(f"- Nhóm lớn nhất có {max(group_sizes)} ảnh")
    
    # In thông tin về 5 nhóm lớn nhất
    if total_groups > 0:
        print("\nCác nhóm lớn nhất:")
        sorted_groups = sorted(similar_groups, key=len, reverse=True)
        for i, group in enumerate(sorted_groups[:5]):
            print(f"  Nhóm {i+1}: {len(group)} ảnh")
            for j, img in enumerate(group[:3]):
                print(f"    - {img.name}")
            if len(group) > 3:
                print(f"    - ... và {len(group)-3} ảnh khác")

def main():
    print("🔍 TÌM VÀ XỬ LÝ ẢNH TƯƠNG TỰ")
    print("=" * 35)
    
    # Nhập đường dẫn thư mục từ người dùng
    directory = input("Nhập đường dẫn thư mục chứa ảnh: ").strip().strip('"').strip("'")
    if not directory:
        print("❌ Chưa nhập đường dẫn thư mục.")
        return
    
    # Nhập các tham số khác
    hash_method = input("Chọn phương pháp hash (phash/dhash/ahash/whash) [mặc định: phash]: ").lower()
    if hash_method not in ['phash', 'dhash', 'ahash', 'whash']:
        hash_method = 'phash'
    
    try:
        threshold = int(input("Nhập ngưỡng tương tự (khuyến nghị 5-10, số càng thấp càng nghiêm ngặt) [mặc định: 8]: ") or "8")
    except ValueError:
        threshold = 8
    
    try:
        hash_size = int(input("Nhập kích thước hash [mặc định: 8]: ") or "8")
    except ValueError:
        hash_size = 8
        
    try:
        min_files = int(input("Số file tối thiểu trong thư mục để xử lý [mặc định: 5]: ") or "5")
    except ValueError:
        min_files = 5
    
    output_dir = input("Nhập thư mục đầu ra cho ảnh trùng lặp [mặc định: duplicates]: ") or "duplicates"
    
    dry_run = input("Chỉ hiển thị kết quả, không di chuyển file (y/n) [mặc định: n]: ").lower().startswith('y')
    
    print("\nCấu hình:")
    print(f"- Thư mục nguồn: {directory}")
    print(f"- Phương pháp hash: {hash_method}")
    print(f"- Ngưỡng tương tự: {threshold}")
    print(f"- Thư mục đầu ra: {output_dir}")
    print(f"- Chế độ xem trước (dry-run): {'Có' if dry_run else 'Không'}")
    
    confirm = input("\nXác nhận tiếp tục? (y/n) [mặc định: y]: ")
    if confirm.lower().startswith('n'):
        print("Hủy thao tác.")
        return
    
    # Tìm các ảnh tương tự
    similar_groups = find_similar_images(
        directory, 
        threshold, 
        hash_size, 
        hash_method,
        min_files
    )
    
    # In thống kê
    print_image_stats(similar_groups)
    
    # Di chuyển ảnh trùng lặp nếu không ở chế độ dry-run
    if not dry_run:
        move_duplicates_to_folder(similar_groups, output_dir)
    else:
        print("\nChế độ dry-run: Không di chuyển file nào.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nĐã hủy thao tác.")
    except Exception as e:
        print(f"Lỗi không xác định: {str(e)}")
