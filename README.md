# Kho Map Tracking – Điều Hòa B2B

Ứng dụng web theo dõi tồn kho điều hòa theo bản đồ. Mỗi kho hiển thị trên bản đồ Việt Nam (Leaflet + OpenStreetMap), click vào kho để xem chi tiết tồn kho và thao tác nhập/xuất/chuyển hàng.

## Tính năng

- 🗺️ **Bản đồ kho**: marker hiển thị tổng số máy tồn của từng kho, đổi màu theo trạng thái (xanh = ổn, cam = có mã sắp hết, đỏ = có mã hết hàng).
- 📦 **Chi tiết tồn kho**: bảng sản phẩm theo kho với số tồn, mức tối thiểu, cảnh báo SẮP HẾT / HẾT.
- ➕➖⇄ **Nhập kho / Xuất kho / Chuyển kho** giữa các kho, có ghi chú.
- 🕘 **Lịch sử giao dịch** nhập/xuất/chuyển gần nhất.
- 🔍 **Tìm kiếm** model/mã hàng trên toàn bộ các kho — bấm kết quả để nhảy đến kho tương ứng.
- 📊 **Thống kê tổng quan**: số kho, tổng máy tồn, số mã hàng, số mã sắp hết.
- 💾 Dữ liệu lưu tại **localStorage** của trình duyệt; nút "↺ Dữ liệu mẫu" để khôi phục seed ban đầu.

## Chạy app

Mở trực tiếp `index.html` bằng trình duyệt, hoặc chạy web server tĩnh:

```bash
npx serve .
# hoặc
python3 -m http.server 8000
```

Leaflet đã được đóng gói sẵn trong `vendor/leaflet/` nên app chạy được offline; chỉ lớp nền bản đồ (tile OpenStreetMap) cần internet. Nếu offline, marker kho và toàn bộ chức năng tồn kho vẫn hoạt động bình thường.

## Cấu trúc

```
index.html       – giao diện chính
css/style.css    – style
js/app.js        – logic: dữ liệu, bản đồ, nhập/xuất/chuyển kho, tìm kiếm
vendor/leaflet/  – thư viện Leaflet 1.9.4 (đóng gói sẵn, không cần CDN)
```

## Dữ liệu mẫu

4 kho (TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ) với 8 model điều hòa phổ biến (Daikin, Panasonic, LG, Casper, Midea). Chỉnh sửa mảng `SEED` trong `js/app.js` để thay đổi danh sách kho/sản phẩm mặc định.
