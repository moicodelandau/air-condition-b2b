---
name: video
description: Chạy chuỗi tạo 1 video marketing cho Điện máy Anh Sơn từ chủ đề đến gói sản xuất đã kiểm duyệt, rồi chạy tối ưu. Dùng khi người dùng gõ /video <chủ đề> hoặc yêu cầu làm 1 video mới.
---

# Chuỗi tạo 1 video

Bạn là điều phối (xem CLAUDE.md). Làm đúng thứ tự, không tự làm thay agent.

1. **Mã chạy:** `runs/NNN-<slug-chu-de>/` (NNN = số tiếp theo). Tạo thư mục.
2. **Brief** → ghi `brief.md` theo mẫu dưới (≤ 15 dòng). Thiếu thông tin quan trọng (sản phẩm cụ thể, ưu đãi) → hỏi người dùng 1 câu, không đoán.
3. **Giao `kich-ban`:** "Brief ở runs/<mã>/brief.md. Ghi ra runs/<mã>/kich-ban.md."
4. **Giao `san-xuat`:** "Kịch bản ở runs/<mã>/kich-ban.md. Ghi ra runs/<mã>/san-xuat.md."
5. **Giao `kiem-duyet`:** "Chấm runs/<mã>/kich-ban.md và runs/<mã>/san-xuat.md. Ghi ra runs/<mã>/kiem-duyet.md."
   - SỬA → giao lại đúng agent bị lỗi kèm đường dẫn `kiem-duyet.md`, rồi chấm lại. Tối đa 2 vòng.
   - CHẶN → dừng, báo người dùng.
6. **Ghi `log.md`** sau MỖI bước: `| bước | agent | model | token | thời gian | vòng | kết quả |` (token và thời gian lấy từ kết quả trả về của agent; không có thì ghi "?").
7. **Giao `toi-uu`:** "Đọc runs/<mã>/log.md và runs/<mã>/kiem-duyet.md. Ghi ra runs/<mã>/toi-uu.md."
8. **Báo người dùng** (≤ 10 dòng): kết quả kiểm duyệt, tổng token, việc người dùng cần làm để ra video thật (quay, chạy prompt Gemini, dựng CapCut), và top 3 đề xuất của `toi-uu` chờ duyệt.

## Mẫu brief.md
```
Chủ đề:
Mục tiêu (1 câu):
Khán giả:
Trụ cột: thi công thật | kiến thức | chống vẽ bệnh | case/đánh giá | ưu đãi
Kênh chính: TikTok (kèm bản Shopee Video, Zalo)
Thời lượng: 25–45s
CTA: nhắn Zalo OA Anh Sơn
Sản phẩm/ưu đãi nhắc tới (nếu có):
Ai đóng: (thợ/nhân viên thật)
Ghi chú/cấm:
```
