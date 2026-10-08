# ASC – Kế hoạch Marketing đa kênh + Hệ thống AI Agent

Phạm vi: Zalo · TikTok · Shopee · Thời gian: 12/10/2026 → 31/07/2027 (qua 1 mùa nóng trọn vẹn)
Ngành: điều hoà / máy lạnh – bán, lắp đặt, vệ sinh, bảo trì (B2B + B2C)

---

## 0. Ba điều phải nói thẳng trước khi làm

**1. B2B và TikTok/Shopee không khớp nhau.** TikTok và Shopee chủ yếu là kênh **B2C** (hộ gia đình, căn hộ, shop nhỏ). Khách B2B (văn phòng, nhà hàng, khách sạn, nhà xưởng, nhà thầu, chủ đầu tư) gần như không chốt hợp đồng qua Shopee; họ tìm qua Google, giới thiệu, Zalo, và *xem* TikTok để kiểm tra độ uy tín. Vì vậy:
- **TikTok** = kéo khách mới B2C + "hồ sơ năng lực bằng video" cho B2B.
- **Shopee** = bán sản phẩm/vật tư/voucher dịch vụ cho B2C. **Nếu ASC không bán hàng hoá trên Shopee thì kênh này xuống ưu tiên thấp nhất.**
- **Zalo** = nơi chốt và giữ khách, cho cả B2B lẫn B2C. Đây là kênh quan trọng nhất về doanh thu.

**2. "Boost" chỉ nên hiểu là quảng cáo trả phí chính chủ** (TikTok Ads/Spark Ads, Shopee Ads, Zalo Ads). ⚠️ **Không dùng tool tăng view/like/follow ảo, bot tự comment, hay seeding bằng nick ảo.** Hậu quả không đảo ngược được: TikTok bóp reach tài khoản lâu dài, Shopee phạt điểm Sao Quả Tạ/khoá shop. Hệ quả bậc hai: mất luôn kênh đã đầu tư nhiều tháng, phải làm lại từ tài khoản mới không có lịch sử.

**3. Thời điểm hiện tại (tháng 10) là mùa thấp điểm lắp mới ở miền Bắc** — đây là lợi thế, không phải bất lợi. Mùa cao điểm (khoảng tháng 3–7) mà mới bắt đầu dựng nội dung là trễ. 10/2026–02/2027 dùng để: dựng hệ thống agent, tích luỹ thư viện video thật, chạy chiến dịch vệ sinh/bảo trì cuối năm & Tết, ký hợp đồng bảo trì năm với B2B. Đến tháng 3/2027 thì "bung" ngân sách.

> Giả định đang dùng (sửa nếu sai): ASC có đội thợ riêng, phục vụ 1–2 tỉnh/thành, có (hoặc sẽ có) shop Shopee bán máy/vật tư, chưa có quy trình nội dung bài bản.

---

## 1. Vai trò từng kênh

| Kênh | Vai trò trong phễu | Nội dung chính | Đo bằng |
|---|---|---|---|
| **TikTok** | Kéo người lạ, tạo niềm tin | Clip thi công thật, vệ sinh máy (nước bẩn), tip tiết kiệm điện, "thợ vẽ bệnh", case B2B | Lượt xem 3s, tỷ lệ xem hết, inbox/Zalo click |
| **Shopee** | Bán hàng có giá rõ ràng | Listing máy + combo lắp đặt, vật tư, voucher vệ sinh; Shopee Video; Live mùa nóng | Đơn, tỷ lệ chuyển đổi, ROAS |
| **Zalo OA** | Chốt + giữ chân + bán lại | Tư vấn, báo giá, xác nhận lịch, nhắc vệ sinh định kỳ 6 tháng, ưu đãi khách cũ | Lead, tỷ lệ chốt, tỷ lệ quay lại |
| **Zalo cá nhân/nhóm (B2B)** | Chăm khách doanh nghiệp | Báo giá dự án, hồ sơ năng lực, nhóm Zalo riêng với từng khách B2B | Số hợp đồng, giá trị hợp đồng |

**Nguyên tắc phễu:** TikTok/Shopee Video kéo người lạ → hồ sơ TikTok + đánh giá Shopee tạo niềm tin → **mọi CTA dẫn về Zalo OA** → Zalo chốt và tự động nhắc bảo trì → khách cũ quay lại + giới thiệu.

---

## 2. Kiến trúc hệ thống agent

```
                      ┌─────────────────────────────┐
                      │  BẠN = Marketing Lead        │  duyệt kế hoạch tháng, duyệt nội dung,
                      │  (người quyết định cuối)     │  quyết ngân sách
                      └──────────────┬──────────────┘
          ┌──────────────────────────┼───────────────────────────┐
   LỚP NÃO                    LỚP XƯỞNG                     LỚP PHÂN PHỐI
   A1 Research & Trend        A3 Script & Copy              A6 Shopee Ops
   A2 Strategist/Planner      A4 Visual (ảnh)               A7 Zalo CRM
                              A5 Video                      A8 Ads/Boost
          └──────────────────────────┼───────────────────────────┘
                              LỚP KIỂM SOÁT
                              A9 QA & Compliance  (cổng chặn trước khi đăng)
                              A10 Analytics       (vòng phản hồi hằng tuần → A2)
```

**Luồng 1 tuần:** A1 (thứ 2) → A2 ra lịch tuần → A3 viết kịch bản → *quay thật với thợ* → A4/A5 sản xuất → **A9 duyệt** → bạn duyệt → đăng/lên lịch → A6/A7/A8 phân phối → A10 báo cáo (chủ nhật) → quay lại A2.

**Mỗi "agent" thực chất là gì?** Ở giai đoạn đầu: một **Gem** trong Gemini hoặc một **Project** trong Claude, có sẵn hướng dẫn + file kiến thức (brand kit, bảng giá, catalog). Bạn là người chuyển output giữa các agent. Chỉ tự động hoá (n8n) **sau khi** quy trình chạy ổn định 6–8 tuần — tự động hoá một quy trình chưa ổn chỉ làm sai nhanh hơn.

---

## 3. Chi tiết từng agent

### Bảng tổng hợp

| # | Agent | Nhiệm vụ | Công cụ chính | Tần suất | Người duyệt |
|---|---|---|---|---|---|
| A1 | Research & Trend | Đối thủ, từ khoá Shopee, trend TikTok, câu hỏi khách hay hỏi | Gemini Deep Research, TikTok Creative Center, thanh tìm kiếm Shopee | Thứ 2 hằng tuần + sâu 1 lần/tháng | Bạn đọc lướt |
| A2 | Strategist/Planner | Kế hoạch tháng, lịch nội dung tuần, chia trụ cột | Claude Project | Tháng + tuần | **Bạn duyệt** |
| A3 | Script & Copy | Kịch bản clip, caption, hashtag, tiêu đề/mô tả Shopee, tin nhắn Zalo | Claude Project | Hằng ngày | A9 → bạn |
| A4 | Visual | Ảnh bìa Shopee, banner, ảnh khuyến mãi, mockup "máy trong phòng khách" | Gemini (Nano Banana), Canva | Theo lịch | A9 |
| A5 | Video | Dựng clip từ footage thật, phụ đề, lồng tiếng, B-roll AI | CapCut, Gemini Veo/Flow, TTS tiếng Việt | Theo lịch | A9 → bạn |
| A6 | Shopee Ops | Tối ưu listing, voucher, đăng ký sự kiện ngày đôi, Shopee Video, Live | Shopee Seller Centre + Claude | 2–3 lần/tuần | Bạn |
| A7 | Zalo CRM | Kịch bản OA, chatbot FAQ, ZNS xác nhận/nhắc lịch, phân loại lead B2B/B2C | Zalo OA Manager, Claude | Hằng ngày | Bạn (kịch bản), tự chạy (vận hành) |
| A8 | Ads/Boost | Chọn bài để boost, set ngân sách, áp luật tắt/tăng | TikTok Ads Manager, Shopee Ads, Zalo Ads | 3 lần/tuần | **Bạn quyết tiền** |
| A9 | QA & Compliance | Chặn sai giá, sai thông số, tuyên bố quá đà, thiếu nhãn AI | Claude Project | Mỗi nội dung | — (là cổng chặn) |
| A10 | Analytics | Gom số liệu 3 kênh, báo cáo tuần, đề xuất | Google Sheets + Gemini trong Sheets / Claude | Chủ nhật | Bạn |

### Hướng dẫn (system prompt) rút gọn cho từng agent

Dán vào phần "Instructions" của Gem hoặc Claude Project. Mọi agent đều được nạp chung bộ **Knowledge pack** (mục 3.1).

**A1 – Research & Trend**
> Bạn là nhà nghiên cứu thị trường điều hoà tại [tỉnh/thành]. Mỗi tuần, trả về: (1) 5 chủ đề/âm thanh/format đang lên trên TikTok liên quan nhà cửa, điện, nóng, tiết kiệm; (2) 10 từ khoá Shopee khách đang tìm cho máy lạnh/vật tư/vệ sinh; (3) 3 điều đối thủ [liệt kê] đang làm mà ASC chưa làm; (4) 5 câu hỏi khách hay hỏi nhất tuần qua (từ dữ liệu inbox tôi dán vào). Ghi rõ nguồn; phần nào là suy luận thì đánh dấu [suy luận].

**A2 – Strategist/Planner**
> Bạn lập lịch nội dung cho ASC. Input: báo cáo A1, báo cáo A10 tuần trước, mùa vụ hiện tại, ưu đãi đang chạy, năng lực thợ còn trống tuần tới. Output: bảng lịch tuần (ngày, kênh, trụ cột, chủ đề, format, CTA, cần quay gì). Tuân thủ tỷ lệ trụ cột ở mục 5. Không đẩy ưu đãi lắp đặt khi lịch thợ đã kín > 80%.

**A3 – Script & Copy**
> Bạn viết nội dung tiếng Việt cho ASC, giọng thợ lành nghề nói thật, không màu mè. Kịch bản TikTok 20–45s: Hook 0–3s (hình ảnh gây tò mò hoặc câu hỏi đau), Nội dung (1 ý duy nhất), CTA về Zalo OA. Mỗi kịch bản ghi rõ: cảnh quay, lời thoại, chữ trên màn hình, B-roll cần có. Cấm: hứa "tiết kiệm X% điện" nếu không có số liệu nhà sản xuất; cấm chê thương hiệu đối thủ đích danh; giá phải lấy từ bảng giá trong knowledge pack.

**A4 – Visual**
> Bạn thiết kế hình ảnh theo brand kit ASC (màu, font, logo, vị trí logo). Ảnh sản phẩm Shopee: nền sạch, đúng mẫu máy thật, không thay đổi hình dáng sản phẩm. Ảnh minh hoạ/mockup phải là ảnh minh hoạ, không được giả làm ảnh công trình thật. Mọi chữ tiếng Việt trên ảnh phải được kiểm chính tả trước khi xuất.

**A5 – Video**
> Bạn dựng clip dọc 9:16 từ footage thật do thợ quay. Ưu tiên: 3 giây đầu mạnh nhất, phụ đề tiếng Việt to, nhịp cắt nhanh. B-roll AI (Veo) chỉ dùng cho cảnh minh hoạ cảm xúc (nóng bức, gia đình mát mẻ), không dùng thay cảnh thi công. Clip có cảnh AI → bật nhãn nội dung AI khi đăng TikTok. Xuất 3 phiên bản: TikTok, Shopee Video, Zalo.

**A6 – Shopee Ops**
> Bạn tối ưu shop Shopee của ASC. Tiêu đề: [Thương hiệu] + [Loại máy] + [Công suất BTU] + [Inverter/Thường] + [Ưu điểm chính] + [Kèm lắp đặt nếu có]. Kiểm tra: thuộc tính đầy đủ, ảnh đủ, video sản phẩm, voucher shop. Nhắc lịch đăng ký chương trình ngày đôi trước hạn. Báo cáo listing có lượt xem cao nhưng chuyển đổi thấp để sửa.

**A7 – Zalo CRM**
> Bạn vận hành Zalo OA của ASC. Phân loại mỗi lead: B2C (hộ gia đình) hay B2B (doanh nghiệp/dự án) và mức nóng. B2C: báo giá theo bảng, đặt lịch. B2B: hỏi 4 thông tin (loại công trình, diện tích/số phòng, thời hạn, người quyết định) rồi chuyển người thật trong 30 phút. Kịch bản sau dịch vụ: cảm ơn → hỏi đánh giá sau 3 ngày → nhắc vệ sinh sau 6 tháng. Không gửi tin quảng cáo dồn dập (tối đa theo hạn mức OA và không quá 1 tin khuyến mãi/tuần).

**A8 – Ads/Boost**
> Bạn đề xuất phân bổ ngân sách quảng cáo. Chỉ boost bài đã có tín hiệu organic tốt (tỷ lệ xem hết hoặc tương tác cao hơn trung bình tài khoản). Áp luật: tắt nhóm quảng cáo khi chi phí/lead vượt trần (mục 7) sau khi đã tiêu đủ ngân sách kiểm định; tăng 20–30% ngân sách cho nhóm đạt dưới 70% trần. Mọi đề xuất tăng chi phải chờ người duyệt.

**A9 – QA & Compliance**
> Bạn là cổng kiểm duyệt cuối. Với mỗi nội dung, kiểm: (1) giá/khuyến mãi khớp bảng giá hiện hành; (2) thông số kỹ thuật khớp catalog; (3) không có tuyên bố tuyệt đối/không chứng minh được ("rẻ nhất", "tốt nhất", "tiết kiệm 70% điện"); (4) không dùng hình/nhạc vi phạm bản quyền; (5) cảnh AI đã gắn nhãn; (6) không lộ mặt/địa chỉ khách khi chưa xin phép; (7) chính tả. Trả về: ĐẠT / SỬA (liệt kê lỗi cụ thể) / CHẶN.

**A10 – Analytics**
> Input: file xuất số liệu tuần từ TikTok Studio, Shopee, Zalo OA, Ads + sheet lead. Output: 5 con số quan trọng nhất so với tuần trước, top 3 / bottom 3 nội dung, 3 đề xuất cụ thể cho tuần tới. Không suy luận nguyên nhân khi dữ liệu chưa đủ — ghi "chưa đủ dữ liệu".

### 3.1 Knowledge pack (nạp cho mọi agent – làm 1 lần, cập nhật hằng tháng)

1. Brand kit: logo, màu, font, giọng văn, 10 câu "nói thế này / không nói thế kia".
2. Bảng giá hiện hành: lắp đặt, vệ sinh, nạp gas, bảo trì; combo; khu vực phục vụ.
3. Catalog máy đang bán (PDF/thông số nhà sản xuất).
4. Hồ sơ năng lực B2B: công trình đã làm, ảnh thật, chứng nhận đại lý/uỷ quyền nếu có.
5. 30 câu hỏi thường gặp + câu trả lời chuẩn (lấy từ inbox thật).
6. Danh sách đối thủ chính.
7. Quy tắc cấm (mục 9).

---

## 4. Tận dụng tài khoản Gemini Pro

Tài khoản Gemini Pro (gói Google AI Pro) **có giá trị thật** cho dự án này, chủ yếu ở mảng hình ảnh/video/nghiên cứu — đúng chỗ Claude yếu. Hạn mức cụ thể (số video/ngày, số ảnh) Google thay đổi thường xuyên → kiểm tra trong app; dưới đây là cách dùng, độ tin cậy về tính năng: cao, về hạn mức: trung bình.

| Tính năng Gemini Pro | Dùng cho agent | Cách dùng cụ thể |
|---|---|---|
| **Gems** (agent tuỳ chỉnh) | A1, A4, A5, A10 | Mỗi agent = 1 Gem, nạp hướng dẫn mục 3 + knowledge pack. Đây là cách rẻ nhất để có "đội agent" mà không cần code. |
| **Nano Banana** (tạo/chỉnh ảnh) | A4 | Xoá nền, làm sạch ảnh sản phẩm; ghép máy vào ảnh phòng khách để minh hoạ "đặt máy ở đâu đẹp"; banner ưu đãi; ảnh bìa Shopee. Chỉnh sửa ảnh thật giữ đúng sản phẩm tốt hơn là tạo mới hoàn toàn. |
| **Veo** (tạo video, trong app Gemini hoặc Flow) | A5 | Clip 8 giây làm hook/B-roll: phòng nóng hầm hập, gia đình mát mẻ, văn phòng mát. Hạn mức theo ngày → dùng cho cảnh khó quay, không dùng sản xuất hàng loạt. |
| **Deep Research** | A1 | Báo cáo đối thủ, giá thị trường, xu hướng mua máy lạnh mùa nóng 2027, danh sách ngành B2B tiềm năng tại khu vực. |
| **NotebookLM** | A7, A3 | Nạp catalog các hãng + FAQ → hỏi đáp chính xác theo tài liệu; soạn câu trả lời kỹ thuật cho khách B2B; làm "trợ lý tư vấn" nội bộ cho nhân viên mới. |
| **Gemini trong Sheets/Docs/Gmail** | A10, A7 | Phân tích file số liệu tuần, soạn báo giá/hồ sơ năng lực B2B. (Tuỳ tài khoản có được bật hay không — kiểm tra.) |
| **2TB Google Drive** | Toàn hệ thống | Kho footage thô + thư viện asset dùng chung, đặt tên theo quy ước để agent tìm được. |

**Không nên trông chờ Gemini Pro vào:**
- **Đăng bài tự động** lên TikTok/Shopee/Zalo — không có tích hợp, vẫn đăng tay hoặc qua công cụ lên lịch của từng nền tảng.
- **Gọi API từ n8n** — gói Gemini Pro (thuê bao) **không bao gồm** quota Gemini API; API tính phí riêng qua Google AI Studio/Cloud. (Độ tin cậy: khá cao — kiểm tra lại chính sách hiện hành trước khi dựng n8n.)
- **Thay cảnh thi công thật bằng AI** — với dịch vụ kỹ thuật, khách tin tay nghề thật. Video AI giả làm thợ lắp máy = rủi ro uy tín + vi phạm quy định nhãn AI của TikTok.

**Chia việc Claude vs Gemini (gợi ý):** Claude → chiến lược, kịch bản/copy tiếng Việt, kiểm duyệt (A2, A3, A6, A7, A9), dựng workflow n8n bằng Claude Code khi tới giai đoạn tự động hoá. Gemini → nghiên cứu, hình ảnh, video, kho kiến thức (A1, A4, A5, NotebookLM cho A7), phân tích Sheets (A10). CapCut → dựng video cuối (phụ đề tiếng Việt tự động).

---

## 5. Trụ cột nội dung & quy trình sản xuất

### 5 trụ cột (tỷ lệ gợi ý, chỉnh theo dữ liệu A10)

| Trụ cột | Tỷ lệ | Ví dụ |
|---|---|---|
| **Thi công thật / hậu trường** | 35% | Vệ sinh máy ra nước đen, đi ống đồng gọn, lắp máy âm trần văn phòng, timelapse công trình |
| **Kiến thức hữu ích** | 25% | Chọn công suất theo diện tích, inverter hay thường, 5 thói quen làm tốn điện, khi nào cần nạp gas thật |
| **Chống "vẽ bệnh" / minh bạch** | 15% | "Thợ báo hết gas — kiểm tra thế nào?", bảng giá công khai, cảnh báo chiêu trò |
| **Case B2B & đánh giá khách** | 15% | "Lắp 20 máy cho nhà hàng X trong 2 ngày", phỏng vấn ngắn chủ quán, ảnh chụp đánh giá 5 sao |
| **Ưu đãi & sự kiện** | 10% | Combo mùa nóng, ngày đôi Shopee, vệ sinh đón Tết, Live |

### Quy trình "1 buổi quay → 15+ asset" (lặp mỗi tuần)

1. **Thứ 2 – A1 + A2:** chốt 5–7 chủ đề tuần, A3 viết kịch bản + **shot list cho thợ** (cảnh cần quay ở công trình nào).
2. **Thứ 3–5 – Thợ quay thật** tại công trình bằng điện thoại (giá kẹp, quay dọc, xin phép chủ nhà). Mỗi buổi thi công đủ cho 2–3 clip. Upload ngay lên Drive theo thư mục `YYYY-MM-DD_tencongtrinh`.
3. **A5 dựng** → 3 bản (TikTok / Shopee Video / Zalo); **A4** làm ảnh bìa + ảnh tĩnh từ cùng chủ đề; **A3** viết caption từng kênh.
4. **A9 duyệt** → bạn duyệt lần cuối (5–10 phút/ngày).
5. **Lên lịch:** TikTok (lên lịch trong TikTok Studio), Shopee Video, Zalo OA (bài viết + broadcast theo hạn mức).
6. **Chủ nhật – A10** báo cáo → bạn chọn 1–2 bài cho A8 boost tuần sau.

**Tần suất mục tiêu (khi đã chạy ổn):** TikTok 5–7 clip/tuần · Shopee Video 3–5 clip/tuần · Zalo OA 2 bài/tuần + 1 broadcast · Shopee Live 1 buổi/tuần (chỉ từ mùa nóng).

---

## 6. Timeline chi tiết (12/10/2026 → 31/07/2027)

### Giai đoạn 0 — Nền móng (Tuần 1–3: 12/10 → 01/11/2026)

| Tuần | Việc | Agent/Người | Đầu ra |
|---|---|---|---|
| T1 (12–18/10) | Làm knowledge pack (mục 3.1); chốt brand kit; chốt bảng giá & khu vực phục vụ | Bạn + A3 hỗ trợ | Thư mục "ASC Knowledge" trên Drive |
| T1 | Kiểm tra/chuẩn hoá tài khoản: TikTok Business, Zalo OA (xác thực), Shopee shop; mở TikTok Ads, Zalo Ads | Bạn | Tài khoản sẵn sàng |
| T2 (19–25/10) | Tạo 10 agent: Gems (A1, A4, A5, A10) + Claude Project (A2, A3, A6, A7, A8, A9); test mỗi agent bằng 3 tình huống thật | Bạn | 10 agent chạy được |
| T2 | A1 chạy Deep Research lần đầu: đối thủ, từ khoá, format TikTok ngành | A1 | Báo cáo nền |
| T2 | Đào tạo thợ quay: 1 buổi 1 giờ, phát shot list mẫu + quy tắc xin phép khách | Bạn | Thợ biết quay |
| T3 (26/10–01/11) | A7 soạn kịch bản Zalo OA: chào mừng, menu, FAQ tự động, xác nhận lịch, sau dịch vụ, nhắc 6 tháng; đăng ký mẫu ZNS (cần thời gian duyệt) | A7 + bạn | Zalo OA vận hành |
| T3 | A6 tối ưu 10–20 listing Shopee bán chạy nhất (tiêu đề, ảnh, video) | A6 + A4 | Listing chuẩn |
| T3 | Quay + đăng 5–7 clip đầu để "khởi động" tài khoản | Toàn bộ | Clip đầu tiên |

**Cổng chuyển giai đoạn:** 10 agent chạy được, knowledge pack đủ, thợ đã gửi footage ít nhất 2 công trình.

### Giai đoạn 1 — Chạy thử máy nội dung (Tuần 4–8: 02/11 → 06/12/2026)

| Mốc | Việc |
|---|---|
| 02/11 | Chạy đều quy trình tuần (mục 5). Mục tiêu: TikTok 4–5 clip/tuần, Shopee Video 3 clip/tuần |
| 02–08/11 | **Chiến dịch "Vệ sinh máy cuối năm"** (B2C) + **"Hợp đồng bảo trì năm 2027"** (B2B: gửi Zalo cho khách doanh nghiệp cũ) |
| 11/11 | Shopee 11.11: chỉ tham gia nếu listing + voucher đã sẵn sàng — không chạy theo bằng mọi giá |
| 09/11 → 06/12 | **Thử boost nhỏ:** mỗi tuần 1–2 clip có tín hiệu organic tốt → TikTok Spark Ads, ngân sách kiểm định nhỏ; Shopee Ads tìm kiếm cho 3–5 listing chủ lực |
| Mỗi chủ nhật | A10 báo cáo; ghi lại **baseline**: view trung bình, chi phí/lead, tỷ lệ chốt Zalo |
| 30/11–06/12 | Review giai đoạn 1: trụ cột nào thắng, agent nào cần sửa hướng dẫn |

**Cổng chuyển giai đoạn:** có baseline 4 tuần cho mọi KPI ở mục 8; quy trình tuần chạy được mà bạn mất ≤ 1 giờ/ngày duyệt.

### Giai đoạn 2 — Chiến dịch cuối năm & Tết (Tuần 9–17: 07/12/2026 → 07/02/2027)

| Mốc | Việc |
|---|---|
| 07/12 | Bắt đầu chiến dịch **"Vệ sinh điều hoà đón Tết"** — Zalo broadcast khách cũ trước, rồi TikTok + boost |
| 12/12 | Shopee 12.12: combo vệ sinh/vật tư, voucher |
| 12/2026 | B2B: chốt hợp đồng bảo trì năm; gửi hồ sơ năng lực video (A5 dựng 1 clip 60–90s tổng hợp công trình) |
| 01/2027 | Cao điểm đặt lịch vệ sinh trước Tết → **A2 khoá ưu đãi khi lịch thợ kín > 80%** |
| 01/2027 | Bắt đầu tự động hoá phần đã ổn định (n8n): footage mới trên Drive → thông báo A5; form/Zalo lead → Google Sheet; tổng hợp số liệu tuần cho A10 |
| ~25/01 → 06/02 | Nghỉ Tết (Tết Nguyên đán 06/02/2027): lên lịch sẵn nội dung chúc Tết + tip dùng máy ngày Tết; Zalo OA trả lời tự động lịch nghỉ |

### Giai đoạn 3 — Đón đầu mùa nóng (Tuần 18–25: 15/02 → 04/04/2027)

| Mốc | Việc |
|---|---|
| Sau Tết | Chiến dịch **"Mua sớm – lắp sớm – không chờ thợ"**: đặt trước giá tốt cho lắp mới tháng 3–4 |
| 02–03/2027 | B2B: tiếp cận công trình sắp hoàn thiện (văn phòng, nhà hàng, khách sạn mới) bằng hồ sơ năng lực + Zalo |
| 03/2027 | Shopee: nhập/hoàn thiện listing máy mùa nóng; đăng ký các sự kiện ngày đôi 3.3, 4.4 |
| 03/2027 | Tăng TikTok lên 6–7 clip/tuần; thử **Shopee Live** 1 buổi/tuần (thợ trả lời câu hỏi trực tiếp) |
| 03/2027 | A8: chuyển từ "thử nghiệm" sang "nhân rộng" các nhóm quảng cáo đã chứng minh hiệu quả ở giai đoạn 1–2 |

### Giai đoạn 4 — Cao điểm mùa nóng (Tuần 26–42: 05/04 → 31/07/2027)

| Mốc | Việc |
|---|---|
| 04–07/2027 | Ngân sách quảng cáo cao nhất năm, phân bổ theo mục 7 |
| Hằng tuần | ⚠️ **Đối chiếu năng lực thợ trước khi tăng ngân sách** — lead vượt khả năng phục vụ → hẹn trễ → đánh giá xấu trên Shopee/Google → kéo tụt chuyển đổi cả mùa sau |
| 5.5, 6.6, 7.7 | Shopee ngày đôi + Live |
| 06/2027 | Thu thập case B2B/khách hàng hài lòng nhiều nhất năm → kho nội dung cho cả năm sau |
| 31/07/2027 | **Tổng kết năm**: chi phí/khách theo kênh, agent nào giữ/bỏ, kế hoạch mùa thấp điểm 2027 |

---

## 7. Ngân sách — khung ra quyết định (không phải con số cố định)

Không có số liệu biên lợi nhuận của ASC nên không đặt số tiền cụ thể ở đây. Thay vào đó, dùng công thức:

**Trần chi phí/lead (CPL tối đa)** = Lợi nhuận gộp trung bình 1 đơn × Tỷ lệ chốt lead → đơn × 0,3
*(0,3 = chỉ chịu chi tối đa ~30% lợi nhuận gộp cho quảng cáo — chỉnh theo chiến lược của bạn).*
Ví dụ cách tính: nếu lãi gộp 1 đơn vệ sinh là A đồng, chốt được 1/3 số lead → CPL tối đa = A × 1/3 × 0,3. Đơn lắp máy/hợp đồng B2B có trần cao hơn nhiều → tính riêng.

**Phân bổ theo giai đoạn:**
- GĐ0–1: gần như 0đ quảng cáo; chỉ ngân sách kiểm định nhỏ từ tuần 5.
- GĐ2–3: tối đa 70% cho kênh/nhóm quảng cáo đã chứng minh, 20% cho thử biến thể mới, 10% thử kênh/format hoàn toàn mới.
- GĐ4: tăng ngân sách **chỉ khi** (a) CPL dưới trần và (b) lịch thợ còn trống.

**Chi phí công cụ:** Gemini Pro (đã có), Claude (đang dùng), CapCut (có bản miễn phí; bản trả phí tuỳ nhu cầu xuất không watermark/tính năng AI), Canva (tuỳ chọn), Zalo OA gói trả phí + phí ZNS theo tin (khi lượng tin tăng), n8n (tự host hoặc gói cloud — từ GĐ2).

---

## 8. KPI & bảng theo dõi

Mục tiêu cụ thể **đặt sau 4 tuần baseline** (cuối GĐ1) — đặt số trước khi có dữ liệu chỉ là đoán.

| Nhóm | Chỉ số | Kênh | Ai đo |
|---|---|---|---|
| Sản xuất | Số asset/tuần; tỷ lệ bị A9 trả về | Tất cả | A10 |
| Thu hút | View trung bình/clip, tỷ lệ xem hết, follow mới | TikTok, Shopee Video | A10 |
| Lead | Lead mới/tuần (tách B2B/B2C), nguồn lead | Zalo OA, inbox | A7 → A10 |
| Chuyển đổi | Tỷ lệ chốt lead → đơn; đơn Shopee; tỷ lệ chuyển đổi listing | Zalo, Shopee | A6, A7 |
| Hiệu quả tiền | CPL, chi phí/đơn, ROAS Shopee | Ads | A8 |
| Giữ chân | % khách quay lại vệ sinh sau 6 tháng; số hợp đồng bảo trì B2B | Zalo | A7 |
| Uy tín | Điểm đánh giá Shopee, số đánh giá mới | Shopee, Google | A6 |

**Ghi nguồn lead bắt buộc:** mỗi kênh 1 link Zalo OA có tham số riêng hoặc 1 mã ưu đãi riêng; nhân viên tư vấn luôn hỏi "anh/chị biết ASC qua đâu" và ghi vào sheet. Không có cột "nguồn" thì A10 không thể nói kênh nào đáng tiền.

---

## 9. Rủi ro & luật chơi

| Rủi ro | Mức độ | Cách chặn |
|---|---|---|
| Mua view/follow, bot comment, seeding nick ảo | ⚠️ Cao, khó đảo ngược | Cấm tuyệt đối; chỉ dùng quảng cáo chính chủ |
| Video AI không gắn nhãn / giả cảnh thi công | Cao | A9 chặn; quy tắc "AI chỉ làm minh hoạ" |
| Tuyên bố không chứng minh được ("tiết kiệm 70% điện", "rẻ nhất") | Trung bình–cao | A9 chặn; chỉ trích số liệu nhà sản xuất có nguồn. Quy định quảng cáo tại VN đang được siết — nên rà lại luật quảng cáo hiện hành trước GĐ4 (độ tin cậy về chi tiết luật mới: thấp, cần kiểm tra) |
| Lộ mặt/nhà/địa chỉ khách | Trung bình | Xin phép trước khi quay; che biển số nhà |
| Lead vượt năng lực thợ mùa nóng | Cao (mùa 4–7) | A2/A8 đối chiếu lịch thợ hằng tuần |
| Spam Zalo khách cũ → chặn OA | Trung bình | Tối đa 1 tin khuyến mãi/tuần, ZNS chỉ dùng cho tin giao dịch/chăm sóc |
| Phụ thuộc 1 người duyệt (bạn) | Trung bình | Từ GĐ2 uỷ quyền duyệt nội dung "thường" cho A9 + 1 nhân viên; bạn chỉ duyệt ưu đãi và ngân sách |
| Bản quyền nhạc | Trung bình | Chỉ dùng nhạc trong thư viện thương mại của TikTok/CapCut cho tài khoản doanh nghiệp |

---

## 10. Việc làm ngay tuần này (12–18/10/2026)

1. Gom **knowledge pack**: bảng giá, catalog, ảnh công trình thật, 30 câu hỏi khách hay hỏi.
2. Tạo **Gem A1** và chạy Deep Research về đối thủ + từ khoá Shopee ngành máy lạnh tại khu vực của bạn.
3. Tạo **Claude Project A3** (Script & Copy) + **A9** (QA), nạp knowledge pack, viết thử 5 kịch bản TikTok.
4. Phát shot list cho thợ, quay ở 2 công trình tuần này.
5. Kiểm tra Zalo OA đã xác thực chưa; bắt đầu đăng ký mẫu ZNS (mất thời gian duyệt).
