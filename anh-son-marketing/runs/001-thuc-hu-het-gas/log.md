# Log 001 – Thực hư "hết gas"

Ghi chú môi trường pilot: chạy trên Claude Code cloud, mỗi agent là subagent `general-purpose` (mang theo toàn bộ system prompt + bộ công cụ mặc định) được bảo đọc file vai trong `.claude/agents/`. Khi chạy trên máy với subagent tự định nghĩa (chỉ có công cụ Read/Write), chi phí nền mỗi agent dự kiến thấp hơn — cần đo lại ở lần chạy 002.

| bước | agent | model | token | thời gian | vòng | kết quả |
|---|---|---|---|---|---|---|
| 1 | điều phối – brief | (phiên chính) | ? | – | – | brief.md 161 từ |
| 2 | kich-ban | sonnet | 60.188 | 52s | 0 | kich-ban.md 1.058 từ, 7 lần gọi công cụ |
| 3 | san-xuat | sonnet | 66.470 | 82s | 0 | san-xuat.md 3.484 từ, 5 lần gọi công cụ, ước tính 5–6 giờ công người |
| 4 | kiem-duyet | sonnet | 76.971 | 80s | 1 | SỬA – 5 lỗi (kich-ban: 1, 4 · san-xuat: 1, 2, 3, 4, 5), 0 CHẶN |
| 5 | kich-ban (sửa vòng 1, resume phiên cũ) | sonnet | 70.199 lũy kế (≈ +10.000 so với lần đầu) | 18s | 1 | sửa lỗi 1, 4 · lời thoại 104 từ/38s |
| 6 | san-xuat (sửa vòng 1 + rút gọn, resume) | sonnet | 79.666 lũy kế (≈ +13.000) | 35s | 1 | sửa lỗi 1–5 · 3.484 → ~1.620 từ |
| 7 | kiem-duyet (vòng 2, resume) | sonnet | 89.159 lũy kế (≈ +12.000) | 23s | 2 | ĐẠT – 0 lỗi, 0 lỗi mới |

**Tổng (theo số subagent báo, lũy kế cuối mỗi agent):** kich-ban 70.199 + san-xuat 79.666 + kiem-duyet 89.159 ≈ **239.000 token** cho 1 video, 2 vòng kiểm duyệt. Lần chạy đầu của mỗi agent chiếm ~85% (60–77k/agent); các lần resume để sửa chỉ ≈ 10–13k.
Lưu ý cách đọc: "subagent_tokens" là tổng token agent đó dùng tới thời điểm báo; chưa tách được bao nhiêu là token nền (system prompt + định nghĩa công cụ) và bao nhiêu là việc thật.
| 8 | toi-uu | sonnet | 73.782 | 91s | – | 5 đề xuất, chờ người dùng duyệt |

**Tổng cả chuỗi kể cả tối ưu ≈ 313.000 token.**
