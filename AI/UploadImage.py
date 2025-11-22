# dùng dùng Openverse để tải ảnh giấy phép mở (không cần API key)

import os
import re
import time
import csv
import hashlib
import mimetypes
from pathlib import Path
from urllib.parse import urlparse
import requests

# ========== Config ==========
BING_API_KEY = os.getenv("BING_API_KEY")  # Set biến môi trường này nếu dùng Bing
BING_ENDPOINT = "https://api.bing.microsoft.com/v7.0/images/search"
OPENVERSE_ENDPOINT = "https://api.openverse.org/v1/images"

HEADERS_DL = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/122.0.0.0 Safari/537.36"
}
TIMEOUT = 12
PER_PAGE_BING = 150  # max khuyến nghị cho Bing
PER_PAGE_OPENVERSE = 20  # giới hạn cho Openverse khi truy cập ẩn danh (page_size <= 20)
# ===========================

def sanitize_slug(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^\w\-]+", "_", text, flags=re.UNICODE)
    text = re.sub(r"_+", "_", text).strip("_")
    return text or "unnamed"

def ext_from_headers_or_url(headers, url) -> str:
    ctype = headers.get("Content-Type", "").split(";")[0].strip().lower()
    ext = None
    if ctype:
        ext = mimetypes.guess_extension(ctype)  # e.g. .jpeg, .png
        if ext == ".jpe":
            ext = ".jpg"
    if not ext:
        path = urlparse(url).path
        _, dot, tail = path.rpartition(".")
        if dot and len(tail) <= 5:
            ext = "." + tail.lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
        ext = ".jpg"
    return ext

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def md5_bytes(b: bytes) -> str:
    return hashlib.md5(b).hexdigest()

def save_manifest_row(manifest_path: Path, row: dict, header_written: set):
    write_header = manifest_path not in header_written and not manifest_path.exists()
    with manifest_path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(row.keys()))
        if write_header:
            writer.writeheader()
        writer.writerow(row)
    header_written.add(manifest_path)

def search_bing(query: str, needed: int):
    if not BING_API_KEY:
        return []
    headers = {"Ocp-Apim-Subscription-Key": BING_API_KEY}
    results = []
    offset = 0
    while len(results) < needed:
        params = {
            "q": query,
            "count": min(PER_PAGE_BING, needed - len(results)),
            "offset": offset,
            "imageType": "Photo",
            "safeSearch": "Strict",
            "size": "Large",  # ưu tiên ảnh lớn
            "license": "ShareCommercially",  # lọc ảnh cho phép chia sẻ thương mại
        }
        r = requests.get(BING_ENDPOINT, headers=headers, params=params, timeout=TIMEOUT)
        if r.status_code != 200:
            print(f"[Bing] HTTP {r.status_code}: {r.text[:200]}")
            break
        payload = r.json()
        batch = payload.get("value", [])
        if not batch:
            break
        for item in batch:
            results.append({
                "image_url": item.get("contentUrl"),
                "page_url": item.get("hostPageUrl"),
                "license": item.get("license"),
                "engine": "bing"
            })
        offset += len(batch)
        time.sleep(0.2)  # nhẹ nhàng tránh rate limit
    return results[:needed]

def search_openverse(query: str, needed: int):
    results = []
    page = 1
    while len(results) < needed:
        params = {
            "q": query,
            "page": page,
            "page_size": min(PER_PAGE_OPENVERSE, needed - len(results)),
            "license_type": "commercial",  # ưu tiên giấy phép thương mại
            "mature": "false",
            "shouldPersistImages": "false",
        }
        r = requests.get(OPENVERSE_ENDPOINT, params=params, timeout=TIMEOUT)
        if r.status_code != 200:
            print(f"[Openverse] HTTP {r.status_code}: {r.text[:200]}")
            break
        payload = r.json()
        batch = payload.get("results", [])
        if not batch:
            break
        for item in batch:
            results.append({
                "image_url": item.get("url"),
                "page_url": item.get("foreign_landing_url"),
                "license": item.get("license"),
                "engine": "openverse"
            })
        page += 1
        time.sleep(0.25)
    return results[:needed]

# ...existing code...
def download_images(query: str, folder_name: str, target_count: int, out_root: Path):
    cls = sanitize_slug(folder_name)  # Dùng folder_name thay vì query
    out_dir = out_root / cls
    ensure_dir(out_dir)
    manifest_path = out_dir / "manifest.csv"
    header_written = set()

    # Tìm kết quả
    if BING_API_KEY:
        items = search_bing(query, target_count)
        if len(items) < target_count:
            # fallback bổ sung từ Openverse
            items += search_openverse(query, target_count - len(items))
    else:
        print("Không thấy BING_API_KEY, dùng Openverse (ảnh giấy phép mở).")
        items = search_openverse(query, target_count)

    if not items:
        print("Không tìm thấy kết quả.")
        return

    seen_urls = set()
    seen_hashes = set()
    saved = 0
    skipped = 0

    for idx, it in enumerate(items, 1):
        url = it.get("image_url")
        if not url or url in seen_urls:
            skipped += 1
            continue
        seen_urls.add(url)
        try:
            resp = requests.get(url, headers=HEADERS_DL, timeout=TIMEOUT)
            if resp.status_code != 200 or not resp.content:
                skipped += 1
                continue
            # Loại bỏ trùng nội dung
            h = md5_bytes(resp.content)
            if h in seen_hashes:
                skipped += 1
                continue
            seen_hashes.add(h)

            ext = ext_from_headers_or_url(resp.headers, url)
            filename = f"{cls}_{saved+1:04d}{ext}"  # Dùng cls (từ folder_name) thay vì query
            filepath = out_dir / filename
            with open(filepath, "wb") as f:
                f.write(resp.content)
            saved += 1

            row = {
                "filename": filename,
                "class": cls,
                "query": query,
                "folder_name": folder_name,  # Thêm trường folder_name
                "image_url": url,
                "page_url": it.get("page_url"),
                "license": it.get("license"),
                "engine": it.get("engine"),
            }
            save_manifest_row(manifest_path, row, header_written)

            print(f"[{saved}/{target_count}] {filename}")
            if saved >= target_count:
                break
        except Exception as e:
            skipped += 1
            continue

    print(f"Hoàn tất. Lưu {saved} ảnh, bỏ qua {skipped}. Thư mục: {out_dir}")

def main():
    print("Trình tải ảnh (Bing API hoặc Openverse)")
    query = input("Nhập từ khóa tìm kiếm (ví dụ: thermometer digital): ").strip()
    if not query:
        print("Vui lòng nhập từ khóa.")
        return
    
    folder_name = input("Nhập tên thư mục lưu ảnh (ví dụ: nhiet_ke): ").strip()
    if not folder_name:
        print("Vui lòng nhập tên thư mục.")
        return
    
    try:
        target = int(input("Số lượng ảnh cần tải (ví dụ 300): ").strip() or "300")
        target = max(1, min(2000, target))
    except:
        target = 300

    out_root = Path("dataset")
    download_images(query, folder_name, target, out_root)

if __name__ == "__main__":
    main()
# ...existing code...