# ⚡ Quyết Nhanh · Decision Autopilot

Ứng dụng **tự động hoá cách suy nghĩ**: giảm trì hoãn, giảm thời gian cân nhắc, ra quyết định nhanh hơn và có hệ thống hơn. Viết bằng HTML/CSS/JS thuần — không cần cài đặt hay build, mở là chạy, dữ liệu lưu ngay trên máy (localStorage).

*An app that automates your thinking: less procrastination, less deliberation, faster and more systematic decisions. Pure HTML/CSS/JS — no install, no build, data stays on your device. UI is Vietnamese-first with a one-tap English toggle (EN/VI button, top right).*

## Vì sao nó hiệu quả

Phần lớn thời gian "suy nghĩ" thực chất là **nghĩ vòng quanh** vì chưa phân loại được quyết định. App áp dụng các quy tắc đã được chứng minh:

| Quy tắc | Áp dụng trong app |
|---|---|
| **Quy tắc 2 phút** (GTD) | Việc < 2 phút → làm ngay, kèm hẹn giờ 2 phút |
| **Cửa 2 chiều** (Bezos) | Quyết định đảo ngược được → chọn "đủ tốt" trong 5 phút |
| **10/10/10** | Không còn quan trọng sau 10 tháng → không đáng nghĩ lâu |
| **Timeboxing** | Quan trọng nhưng sửa được → đóng khung đúng 15 phút rồi chốt |
| **Quy trình quyết định lớn** | Khó đảo ngược + quan trọng (~5% số quyết định) → 4 bước có cấu trúc + hạn chót |
| **5-4-3-2-1** (Mel Robbins) | Đếm ngược 5 giây rồi phóng thẳng vào phiên tập trung |
| **Luật cá nhân** | Quyết định 1 lần, áp dụng mãi — không bao giờ nghĩ lại |

## 4 tính năng chính

### 🎯 Quyết định (Decide)
Gõ điều đang phân vân → trả lời tối đa **4 câu hỏi Có/Không** → nhận ngay 1 trong 5 phán quyết: **Làm ngay / Giao việc / Quyết nhanh / Đóng khung 15′ / Quyết định lớn**, kèm các bước cụ thể và hẹn giờ tương ứng. Câu hỏi được rút gọn thông minh: trả lời "mất dưới 2 phút" là ra kết quả luôn, không hỏi tiếp.

### 🚀 Bắt đầu (Start) — phá trì hoãn
Ghi việc đang né tránh → thu nhỏ thành **1 bước 5 phút** (có gợi ý sẵn) → đếm ngược 5·4·3·2·1 → phiên tập trung 5/15/25 phút. Đếm phiên trong ngày và chuỗi ngày liên tiếp (streak).

### 📜 Luật cá nhân (Rules)
Kho luật "Nếu… thì…" — mỗi luật là một quyết định bạn không bao giờ phải nghĩ lại. Có sẵn 6 luật mẫu (mua sắm < 500k, chạm email 1 lần, không quyết sau 21h, tung đồng xu khi phân vân quá 10 phút…), thêm/xoá tuỳ ý, bấm "Đã áp dụng ✓" để đếm số lần luật tiết kiệm thời gian cho bạn.

### 📓 Nhật ký (Journal)
Mọi quyết định được ghi tự động kèm **thời gian phân loại (giây)**. Sau đó quay lại đánh giá kết quả 👍/😐/👎 — khi đủ dữ liệu, app hiển thị: *"X% quyết định nhanh của bạn cho kết quả ổn trở lên"* — bằng chứng để não bạn tin vào quyết nhanh và bớt nghĩ quá lâu. Quyết định lớn chưa chốt hiện hạn chót và nút "Chốt ngay". Có nút xuất toàn bộ dữ liệu ra JSON.

Thanh thống kê trên cùng: số quyết định hôm nay · số giây trung bình mỗi quyết định · phiên tập trung hôm nay · chuỗi ngày.

## Chạy thử

Mở trực tiếp `index.html` bằng trình duyệt, hoặc:

```bash
python3 -m http.server 8000
# rồi mở http://localhost:8000
```

## Triển khai — cài như app thật (PWA)

Là static site nên deploy miễn phí lên **GitHub Pages** (Settings → Pages → chọn branch), Netlify, Vercel hoặc bất kỳ hosting nào.

App là **PWA hoàn chỉnh**: có `manifest.webmanifest`, icon riêng (`icons/`) và service worker (`sw.js`) cache toàn bộ app shell. Sau khi deploy, mở link trên điện thoại → **"Thêm vào Màn hình chính" / "Cài đặt ứng dụng"** → app có icon ⚡ riêng, chạy toàn màn hình và **hoạt động cả khi không có mạng**.

## Tuỳ chỉnh

| Muốn đổi | Sửa ở đâu |
|---|---|
| Câu chữ, ngôn ngữ | `js/app.js` — object `I18N` (vi/en) |
| Luật mẫu ban đầu | `js/app.js` — `SEED_RULES` |
| Ngưỡng thời gian các phán quyết (2/5/15 phút) | `js/app.js` — `VERDICT_TIMERS` |
| Logic phân loại quyết định | `js/app.js` — hàm `computeVerdict()` |
| Màu sắc, dark mode | `css/style.css` — biến CSS trong `:root` |

Dữ liệu lưu tại key `quyetnhanh.v1` trong localStorage — xoá key này để reset toàn bộ.
