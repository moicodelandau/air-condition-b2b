# Cài bộ agent Anh Sơn lên Claude trên máy tính (không cần GitHub)

## 1. Đặt thư mục
Giải nén `anh-son-marketing.zip` vào một chỗ cố định, ví dụ `Documents/AnhSon-Marketing`. Thư mục phải giữ nguyên thư mục ẩn `.claude/` (bật "hiện file ẩn" nếu muốn xem: macOS `Cmd+Shift+.`, Windows: View → Hidden items).

## 2. Mở bằng Claude
**Cách A – Claude desktop app (khuyên dùng):** mở app Claude → tab **Code** → chọn thư mục *local* (trên máy, không phải repo GitHub) → chọn `AnhSon-Marketing`.
**Cách B – Terminal:** cài Claude Code, `cd` vào thư mục, gõ `claude`.

Cả hai cách đều tự đọc `CLAUDE.md` (điều phối), `.claude/agents/` (4 agent) và `.claude/skills/video/` (lệnh `/video`).

## 3. Kiểm tra đã nhận chưa
- Gõ `/agents` → phải thấy `kich-ban`, `san-xuat`, `kiem-duyet`, `toi-uu`.
- Gõ `/video` → phải được gợi ý lệnh.

## 4. Trước lần chạy thật đầu tiên
Điền các ô `[ĐIỀN]` trong `kien-thuc/` (tên OA, hotline, khu vực, thợ đóng video, bảng giá). Agent được dặn không bịa, nên còn ô trống thì video vẫn ra nhưng chưa đăng được.

## 5. Chạy
```
/video Vệ sinh điều hoà cuối năm: 3 dấu hiệu máy cần vệ sinh ngay
```
Kết quả nằm trong `runs/NNN-.../`: brief, kịch bản, gói sản xuất, kiểm duyệt, log, đề xuất tối ưu.

## 6. Áp dụng đề xuất của `toi-uu`
Đọc `runs/NNN-.../toi-uu.md`, rồi bảo Claude: "Áp dụng đề xuất 1 và 3". Không tự áp hết — mỗi lần chỉ đổi 1–2 điểm để biết thay đổi nào có tác dụng.

## 7. Sao lưu (thay GitHub)
Để có thể quay lại phiên bản agent cũ khi một đề xuất làm hỏng chất lượng, chọn 1 trong 2:
- Đặt thư mục trong Google Drive for desktop (đã có 2TB từ Gemini Pro) → Drive tự giữ lịch sử phiên bản file.
- Hoặc bảo Claude: "khởi tạo git cục bộ cho thư mục này và commit sau mỗi lần sửa agent" (git chỉ trên máy, không đẩy lên đâu).

## Lưu ý chi phí
Mỗi agent chạy là một phiên riêng nên tốn token nền. Xem `runs/001-*/log.md` để biết một video tốn bao nhiêu, và theo dõi mức dùng trong phần Settings → Usage của tài khoản Claude.
