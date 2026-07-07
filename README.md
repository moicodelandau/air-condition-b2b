# An Nhiên Care – Website Trung tâm Chăm sóc Mẹ & Bé

Website giới thiệu dịch vụ (landing page) cho trung tâm chăm sóc mẹ và bé, viết bằng HTML/CSS/JS thuần — không cần cài đặt hay build, mở là chạy.

## Nội dung trang

- **Dịch vụ**: chăm sóc mẹ sau sinh, tắm bé & massage bé, spa bầu, thông tắc tia sữa, chăm sóc bé tại nhà, lớp học tiền sản
- **Bảng giá**: 3 gói dịch vụ (Cơ Bản / Mẹ & Bé / Cao Cấp)
- **Quy trình** 4 bước, **đội ngũ**, **cảm nhận khách hàng**, **FAQ**
- **Form đặt lịch tư vấn** có kiểm tra số điện thoại
- Responsive đầy đủ cho điện thoại, nút gọi hotline nổi

## Chạy thử

Mở trực tiếp `index.html` bằng trình duyệt, hoặc:

```bash
python3 -m http.server 8000
# rồi mở http://localhost:8000
```

## Triển khai

Là static site nên có thể deploy miễn phí lên **GitHub Pages** (Settings → Pages → chọn branch), Netlify, Vercel hoặc bất kỳ hosting nào.

## Tuỳ chỉnh

| Muốn đổi | Sửa ở đâu |
|---|---|
| Tên trung tâm, hotline, địa chỉ, email | `index.html` (tìm "An Nhiên", "0900 123 456") |
| Màu sắc chủ đạo | Biến `--primary`, `--accent` đầu file `css/style.css` |
| Giá và quyền lợi các gói | Mục `#bang-gia` trong `index.html` |
| Nơi nhận yêu cầu đặt lịch | `js/main.js` — hiện lưu demo vào localStorage; thay bằng `fetch()` tới API, Google Form hoặc Zalo OA khi vận hành thật |

## Cấu trúc

```
├── index.html      # Toàn bộ nội dung trang
├── css/style.css   # Giao diện
└── js/main.js      # Menu mobile + xử lý form đặt lịch
```
