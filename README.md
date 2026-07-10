# Sơ Đồ Kho 50×40m – Gợi ý & Mapping Hàng Hóa

Ứng dụng web vẽ **sơ đồ mặt bằng kho điều hòa thật** và **gợi ý cách xếp hàng tối ưu** dựa trên số tồn thật từ file báo cáo Excel. Không cần server, không cần internet — mở `index.html` là chạy.

## Kho thật được mô hình hóa

- Kho **dài 50m × ngang 40m** (2000m²).
- **Cửa chính hướng Bắc**, rộng 4m cao 4m; **văn phòng kho ở góc phải cửa** (nhìn ra) = góc Đông-Bắc.
- 2 cửa phụ: **Nam** và **Tây**.
- Trần **cao nhất 5m ở giữa kho**, 4m tại tường — sơ đồ vẽ đường đồng mức trần 4.5m, số lớp chồng hàng tự tính theo trần tại từng lô.
- Tồn thật (báo cáo 10/07/2026): **357 model còn hàng, 3136 máy, 30 nhóm hãng/loại** — gồm máy lớn/VRV-VRF, tủ đứng, dàn nóng, ~2650 máy treo tường và hàng linh tinh (nón BH, gia dụng, mô hình…).

## Nguyên tắc gợi ý xếp kho (nút ⚡)

1. **MÁY LỚN / VRV-VRF / tủ đứng** → chỉ để sàn, không chồng, sát **cửa Tây** + lối xe nâng 4m.
2. **Hãng bán chạy + tồn nhiều** (Casper 838, Daikin 467, Panasonic…) → lô gần **CỬA CHÍNH Bắc** và khu tập kết.
3. **Phụ kiện, remote, hàng linh tinh** → gần **văn phòng** để dễ quản lý, tránh thất thoát.
4. Chồng hàng theo trần: treo tường tối đa **8 lớp** giữa kho (5m), ~7 lớp sát tường (4m); máy vừa 3 lớp, máy lớn 2 lớp, VRV không chồng; thùng nặng nằm dưới.
5. Mỗi lô tối đa 3 nhóm hàng; lối đi chính Bắc–Nam 4m + lối ngang ra cửa Tây 4m luôn để trống.

## Tính năng

- 🗺️ Sơ đồ 2D tỉ lệ thật (lưới 1m): tường, 3 cửa, văn phòng, khu tập kết, lối xe nâng, 25 lô hàng, la bàn.
- 🔍 Tìm model/mã/hãng → lô chứa hàng nhấp nháy đỏ; bấm nhóm hàng ở sidebar để xem mọi lô của nhóm.
- 📦 Bấm lô → chi tiết: trần, số lớp chồng, m² đã dùng, danh sách model thật + số lượng, cảnh báo máy lớn.
- ✎ Sửa sơ đồ: kéo thả lô (bám lưới 0.5m), xoay, thêm/xoá lô, gán nhóm hàng bằng chip.
- 🎨 3 chế độ màu: theo nhóm hàng / độ lấp đầy / số lớp chồng.
- ✅ Checklist dọn kho 5S theo đúng kho này; 📊 thống kê; 💾 lưu localStorage, nút ↺ về sơ đồ gợi ý.

## Chạy app

Tải repo về (Code → Download ZIP trên GitHub), mở `index.html` bằng trình duyệt là chạy — không cần cài gì.

## Cập nhật số liệu → sơ đồ TỰ SẮP XẾP LẠI

Có 4 cách, số thay đổi là sơ đồ tự điều chỉnh:

1. **📥 Nạp Excel/CSV ngay trong app**: bấm nút, chọn file BÁO CÁO (.xlsx) hoặc CSV có sheet/cột TỒN KHO — app đọc trực tiếp trong trình duyệt, tự phân loại, tự chạy lại gợi ý xếp kho. Không cần Python.
2. **🔗 Kết nối Google Sheet**: đưa file báo cáo lên Google Sheets → Tệp → Chia sẻ → *Xuất bản lên web* → chọn trang **TỒN KHO** + định dạng **CSV** → copy link, dán vào nút 🔗. Từ đó **mỗi lần mở app sẽ tự kéo số tồn mới nhất và tự xếp lại**.
3. **Sửa tay trong app**: bấm vào lô → bấm vào số lượng của model → nhập số mới (0 = hết hàng). Sơ đồ tự dồn chỗ; nếu hết chỗ sẽ tự chạy lại gợi ý.
4. **Script Python** (tuỳ chọn, để cập nhật số mặc định trong repo): `python3 tools/xlsx_to_data.py "BÁO CÁO.xlsx"` → ghi đè `js/data.js`.

App tự phân loại từng model từ tên hàng (treo tường / âm trần / tủ đứng / giấu trần / multi / dàn nóng / **VRV-VRF & máy ≥4-5HP** / phụ kiện / linh tinh) và lấy cột XUẤT làm độ bán chạy.

## Xuất sơ đồ dạng JSON

Nút **⬇ JSON** tải file `so-do-kho.json`: kích thước kho, cửa, văn phòng, từng lô (vị trí, m² dùng, trần, nhóm hàng) và **danh sách model + số lượng trên từng lô** — dùng để in, đối chiếu kiểm kê, hoặc nạp vào hệ thống khác.

## Cấu trúc

```
index.html            – giao diện
css/style.css         – style
js/app.js             – sơ đồ SVG, thuật toán gợi ý xếp lô, tìm kiếm, kéo thả
js/data.js            – tồn kho thật (sinh tự động, KHÔNG sửa tay)
tools/xlsx_to_data.py – chuyển Excel -> js/data.js
```

Kích thước kho / cửa / văn phòng / thông số chồng hàng nằm ở đầu `js/app.js` (`CFG`, `DOORS`, `OFFICE`, `SIZE`).
