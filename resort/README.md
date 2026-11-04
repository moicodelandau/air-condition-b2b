# An Viên Resort — resort nhà vườn online

Bản đồ 2D nhìn từ trên xuống của một khu nhà vườn ~17.000 m² (130 × 130 m). Ai cũng có thể ghé chơi, đi dạo, trò chuyện và làm hoạt động. Phong cách đơn giản, chạm là làm, giống các trang "chùa online".

Bản chạy nhiều người: https://claude.ai/artifact/VwL6JCfhYkCXSC1qSvhoRV (mặc định riêng tư, mở quyền ở menu Share).

## Có gì trong resort

| Khu | Hoạt động |
|---|---|
| Hồ bơi 20×14 m | Bơi (vào hồ là tự bơi), nằm ghế tắm nắng |
| Hồ sen + chòi trà | Thả hoa đăng kèm lời ước (trôi 48 giờ, ai cũng thấy), uống trà |
| Vườn cộng đồng | Trồng 9 loại cây, tưới cây của bất kỳ ai; cây lớn qua 4 giai đoạn |
| Bãi cỏ BBQ | Nằm võng, ăn BBQ (lò đốt 18:00–21:30) |
| Nhà chính, 3 bungalow, vườn trái cây, đài phun nước, vườn hoa | Uống nước dừa, nghỉ trưa, hái trái, thả đồng xu |
| Cổng | Sổ lưu bút |

- **Thời gian thật** theo giờ Việt Nam: sáng, hoàng hôn, đêm lên đèn, đom đóm.
- **Thời tiết theo ngày**: sinh từ ngày tháng nên mọi người thấy giống nhau; mùa mưa (tháng 5–11) hay có mưa rào/dông buổi chiều. Bấm đồng hồ để xem dự báo 24 giờ.
- **3 nhân viên** (Chú Tư, Anh Bảy, Cô Năm) đi làm theo lịch giờ thật, tối về nhà nhân viên nghỉ. Bấm vào để chào hỏi.
- **6 thú cưng**: chó Mực, Vàng · mèo Mướp, Miu · thỏ Bông, Tuyết. Có giờ ngủ riêng; vuốt ve, cho ăn.
- **Tối đa 200 khách** online cùng lúc, thấy nhau di chuyển, bong bóng chat, hiệu ứng tim/nước.

## Hai cách chạy

1. **Trên claude.ai (nhiều người)**: dùng capability `room` (ai đang online, vị trí, chat) và `db` (cây trồng, hoa đăng, lưu bút dùng chung). Người được mời quyền *Contributor* trở lên mới trồng cây/viết được; quyền *Viewer* chỉ đi dạo và xem.
2. **Mở file `index.html` trực tiếp hoặc GitHub Pages (một mình)**: mọi thứ vẫn chạy, nhưng chỉ thấy chính mình, dữ liệu lưu trong trình duyệt.

Muốn công khai cho người lạ vào không cần tài khoản: thay `Store` và phần `initRoom()` trong `index.html` bằng một backend realtime (Firebase, Supabase Realtime hoặc server WebSocket nhỏ).

## Tuỳ chỉnh nhanh

Ở đầu `<script>` trong `index.html`:

- `RESORT_NAME`, `CAPACITY`, `W`/`H` (kích thước đất, mét)
- `ZONES`, `SOLIDS`, `PATHS`, `POND`: bố cục bản đồ (toạ độ mét, gốc góc trên-trái, phía Bắc ở trên)
- `STAFF`: tên, lịch làm việc theo giờ, câu thoại
- `PETS`: tên, khu vực chạy chơi, giờ ngủ
- `KINDS`: loại cây trồng được

Phần giữa `<!--ARTIFACT-START-->` và `<!--ARTIFACT-END-->` là nội dung được xuất bản lên claude.ai.
