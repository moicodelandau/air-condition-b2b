# Sơ Đồ Kho Điều Hòa – Warehouse Map Tracking

Ứng dụng web vẽ **sơ đồ mặt bằng bên trong kho** điều hòa để phân khu, tìm vị trí hàng và tối ưu sắp xếp. Không cần server, không cần internet — mở `index.html` là chạy.

## Bài toán

- Kho chứa **19 hãng**, **~300 model** điều hòa.
- Trần dốc: **cao nhất 5m** (tường sau) → **thấp nhất 3.5m** (tường trước).
- Có **3 cửa**: cửa nhập (C1), cửa xuất chính (C2), cửa phụ (C3).
- Cần sắp xếp sao cho dễ tìm, dễ lấy hàng, dễ kiểm kê và dọn kho.

## Tính năng

- 🗺️ **Sơ đồ mặt bằng 2D** (SVG, lưới 1m): tường, 3 cửa, kệ hàng, khu nhận hàng / tập kết xuất / hàng lỗi / phụ kiện.
- 📏 **Số tầng kệ tự tính theo độ cao trần** tại vị trí kệ: khu trần 5m được kệ 4 tầng, khu 3.5m chỉ 2 tầng (mỗi tầng ~1.1m + hở an toàn 0.4m). Sơ đồ vẽ sẵn các đường ranh giới đổi số tầng.
- ⚡ **Tối ưu sắp xếp**: hãng bán chạy + tồn nhiều tự động được xếp vào kệ gần cửa xuất chính; mỗi kệ tối đa 2 hãng; máy nặng (tủ đứng, âm trần) ghi chú xếp tầng 1. Có báo cáo phân bổ và cảnh báo thiếu chỗ.
- 🔍 **Tìm model/hãng** → chỉ ra đúng kệ chứa hàng (kệ nhấp nháy đỏ trên sơ đồ). Bấm tên hãng ở sidebar để tô sáng mọi kệ của hãng đó.
- ✎ **Sửa sơ đồ**: kéo thả kệ (bám lưới 0.5m), xoay kệ, thêm/xoá kệ, gán hãng cho từng kệ bằng chip bấm.
- 🎨 3 chế độ tô màu: theo hãng / theo độ lấp đầy / theo số tầng kệ.
- ✅ **Checklist dọn kho 5S** (Sàng lọc, Sắp xếp, Sạch sẽ, Săn sóc, Sẵn sàng) có lưu tiến độ.
- 📊 Thống kê: số hãng, model, máy tồn, % lấp đầy, số máy chưa có chỗ.
- 💾 Bố trí kệ + checklist lưu **localStorage**; nút "↺ Mặc định" khôi phục sơ đồ chuẩn.

## Chạy app

Mở trực tiếp `index.html` bằng trình duyệt, hoặc:

```bash
python3 -m http.server 8000
```

## Tuỳ biến theo kho thật

Sửa các hằng số đầu file `js/app.js`:

- `DEFAULT_CONFIG`: kích thước kho (mặc định 30×20m) và độ cao trần (5m → 3.5m).
- `DOORS`: vị trí 3 cửa trên tường (N/S/E/W + vị trí tương đối).
- `BRAND_DEFS`: danh sách hãng và độ bán chạy (1–5 sao) — độ bán chạy quyết định hãng nào được ưu tiên gần cửa xuất.
- `LEVEL_H`, `UNITS_PER_M`: chiều cao mỗi tầng kệ và số kiện/mét để tính sức chứa.
- Danh mục ~300 model đang được sinh tự động trong `genModels()` — thay bằng danh sách thật khi có file kiểm kê.

## Cấu trúc

```
index.html      – giao diện chính
css/style.css   – style
js/app.js       – logic: sơ đồ SVG, tính tầng kệ theo trần, tối ưu sắp xếp, tìm kiếm, kéo thả
```
