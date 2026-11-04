# Anh Sơn Retreat — retreat 3D online

Khu nghỉ trên đồi Bảo Lộc dựng lại bằng 3D (Three.js), ai cũng có thể ghé chơi. Bản đồ lấy theo reel của Anh Sơn Retreat: khu đất ~17.000 m² (đa giác ranh đất trong code tính ra 17.136 m²), đường bê tông chạy chéo dọc ranh phía Tây, cụm 3 căn nhà và hồ bơi ở phần cao, đồi chè góc Đông Bắc, đường đất chữ S đổ xuống dốc, sườn giữa trồng cà phê, bơ, sầu riêng và chuối, suối lớn chảy ngang phần thấp có ghềnh đá, thác nhỏ và chòi nghỉ mái xanh. Xung quanh là rừng và ba lớp đồi núi xa.

Bản chạy nhiều người: https://claude.ai/artifact/VwL6JCfhYkCXSC1qSvhoRV (mặc định riêng tư, mở quyền ở menu Share).

## Nhân vật

| Ai | Làm gì |
|---|---|
| **Chị Mơ**, quản lý | Đón khách ở cổng, kiểm tra hồ bơi, dẫn khách tham quan suối, nhóm lửa trại |
| **Chú Ba**, làm vườn | Hái chè buổi sáng, tỉa cà phê và sầu riêng buổi chiều, tưới vườn khách lúc chiều tối |
| **Anh Tèo**, làm vườn | Cho thú cưng ăn, xới vườn khách, cắt cỏ, nướng bắp ở lửa trại |
| **3 khách vãng lai** | Lúc nào cũng có đúng 3 người, đổi người mỗi 2 tiếng, mỗi người một kiểu (dân văn phòng trốn deadline, youtuber, bác tập dưỡng sinh…) |
| **Thú cưng** | Chó Mực, Vàng · mèo Mướp, Miu · thỏ Bông, Tuyết |

Ai cũng có lời thoại vui. Nhân viên và khách vãng lai di chuyển theo giờ thật, nên mọi người xem cùng lúc sẽ thấy họ ở cùng một chỗ.

## Hoạt động

Bơi ở hồ nước lạnh · cà phê ngắm đồi trên hiên · hái chè · trồng 10 loại cây (có mai anh đào, dã quỳ, bơ, sầu riêng, cà phê) và tưới cây của người khác · thả hoa đăng trôi theo suối 48 giờ · ngồi chòi bên suối · lửa trại 18:00–21:30 · vuốt ve, cho thú cưng ăn · sổ lưu bút · chat.

**Thời gian và thời tiết** chạy theo giờ Việt Nam, kiểu khí hậu Bảo Lộc: sáng thường có sương mù, mùa mưa (tháng 5–11) hay mưa chiều, nhiệt độ 15–28°C. Thời tiết sinh từ ngày tháng nên ai xem cũng thấy giống nhau.

## Điều khiển

Chạm mặt đất để đi · kéo để xoay camera · cuộn chuột hoặc chụm hai ngón để zoom · WASD hoặc phím mũi tên · chạm bản đồ nhỏ ở góc để dịch chuyển · nút **Toàn cảnh** để nhìn từ trên cao.

## Hai cách chạy

1. **Trên claude.ai (nhiều người, tối đa 200)**: dùng `room` cho ai đang online, vị trí và chat, dùng `db` cho cây trồng, hoa đăng và lưu bút dùng chung. Người có quyền *Contributor* trở lên mới trồng cây và viết được; quyền *Viewer* chỉ đi dạo và xem.
2. **Mở `index.html` trực tiếp hoặc qua GitHub Pages (một mình)**: chỉ thấy chính mình, dữ liệu lưu trên trình duyệt. Cần mạng để tải Three.js từ cdnjs.

Muốn mở công khai cho người không có tài khoản: thay `Store` và `initRoom()` bằng backend realtime (Firebase, Supabase Realtime hoặc server WebSocket).

## Tuỳ chỉnh

Đầu `<script>` trong `index.html`: `LAND` (ranh đất), `ROAD`, `DRIVE`, `SROAD`, `STREAM` (đường và suối), `POOL`, `TEA`, `GARDEN`, `HUT`, `FALL` (vị trí các khu), `STAFF` (lịch làm việc, câu thoại), `PERSONAS` (khách vãng lai), `PETS`, `KINDS` (loại cây). Toạ độ tính bằng mét, x hướng Đông, z hướng Nam (xuống dốc).

Phần giữa `<!--ARTIFACT-START-->` và `<!--ARTIFACT-END-->` là nội dung được xuất bản lên claude.ai.
