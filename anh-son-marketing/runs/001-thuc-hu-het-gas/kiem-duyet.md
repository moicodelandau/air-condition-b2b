# Kiểm duyệt 001 – Thợ báo "hết gas, nạp thêm là xong"

Đã chấm: `kich-ban.md`, `san-xuat.md` (chuẩn: `quy-tac.md`, `bang-gia.md`).

**KẾT LUẬN: SỬA** · 5 lỗi (2 lỗi ở mục 1–5, 3 lỗi nhẹ ở mục 5 và 7) · không có lỗi CHẶN.
Agent sửa: `kich-ban` (lỗi 1, 4), `san-xuat` (lỗi 1 đồng bộ, 2, 3, 4 đồng bộ, 5).

## Chấm theo rubric

| # | Mục | Kết quả | Ghi chú |
|---|---|---|---|
| 1 | Đúng kỹ thuật | Lỗi nhẹ | Xem lỗi 1. Các ý "hệ kín", "thiếu gas thường là có chỗ rò", "kiểm tra rò rỉ trước khi nạp" đúng theo hiểu biết phổ thông. |
| 2 | Giá/khuyến mãi | Đạt | Không nhắc giá, không khuyến mãi. `bang-gia.md` còn `[ĐIỀN]` nên đúng khi không nói giá. Lưu ý bên dưới. |
| 3 | Từ cấm / tuyên bố tuyệt đối | Đạt | Không có "rẻ nhất", "100%", "tốt nhất". Chỉ nói "thợ" chung, không chê đích danh. Không hướng dẫn khách tự đụng van/gas. |
| 4 | AI | Lỗi | Xem lỗi 2. Video không có cảnh AI (đạt); lỗi nằm ở ảnh bìa AI. |
| 5 | Riêng tư & bản quyền | Lỗi nhẹ | Xem lỗi 3. Nhạc thương mại, che mặt/biển số: đạt. |
| 6 | Hiệu quả | Đạt | Hook 3s có hình và câu hỏi, 1 ý chính, CTA Zalo rõ (còn chờ tên OA). Tốc độ lời thoại khoảng 2,8 âm tiết/giây, đọc được. |
| 7 | Khớp nhau | Lỗi nhẹ | Xem lỗi 4, 5. Mọi cảnh đã có trong shot list. |

## Danh sách lỗi và cách sửa

| # | Mục | Vị trí | Lỗi | Cách sửa | Agent |
|---|---|---|---|---|---|
| 1 | 1 | `kich-ban.md` dòng 9–17s, chữ "Hệ kín: gas không tự hao", caption Zalo "gas không tự hao"; `san-xuat.md` mục 4.3 dòng 9–17 và lời thoại cảnh 3 | "Gas không tự hao" là câu tuyệt đối, chưa chặt (gas vẫn có thể hao rất chậm theo thời gian, máy mới lắp có thể nạp thiếu ngay từ đầu). Tuyên bố #2 ghi mức "cao" là quá tay. | Làm mềm: "Gas chạy vòng kín trong ống, không bị tiêu hao khi máy chạy như xăng trong bình xe." Chữ trên màn hình: "Hệ kín: gas không bị tiêu hao". Hạ mức tuyên bố #2 xuống "trung bình". Sau đó `san-xuat` đồng bộ lời thoại cảnh 3 và bảng chữ nhấn 4.3. | `kich-ban` rồi `san-xuat` |
| 2 | 4 | `san-xuat.md` mục 3, prompt ảnh bìa và ghi chú nhãn | Prompt yêu cầu "photo", "Realistic", bối cảnh "Vietnamese neighborhood" nên ảnh dễ bị tưởng là ảnh thật. Ghi chú nhãn AI chỉ áp dụng "nền tảng nào có mục AI"; `quy-tac.md` yêu cầu gắn nhãn khi đăng, không có điều kiện. | Đổi prompt sang "illustration", bỏ "photo/Realistic", bỏ bối cảnh khu phố thật. Ghi rõ: ảnh bìa AI luôn gắn nhãn AI; nền tảng không có mục nhãn thì thêm chữ "Ảnh minh hoạ do AI tạo" ở góc bìa hoặc trong caption. Phương án an toàn hơn: dùng khung hình thật làm bìa (giữ làm mặc định). | `san-xuat` |
| 3 | 5 | `san-xuat.md` chuẩn bị chung: "Ghi lại tên/số điện thoại chủ nhà vào chỗ [ĐIỀN]" | Dẫn tới việc ghi thông tin cá nhân của khách vào file nội dung. Không cần thiết, và `[ĐIỀN]` ở đầu file là "địa chỉ công trình". | Chỉ ghi "đã xin phép bằng lời/tin nhắn, ngày, người làm chứng" vào chỗ `[ĐIỀN]`. Giữ tên/SĐT/địa chỉ khách ở nơi khác của cửa hàng, không đưa vào file `runs/`. | `san-xuat` |
| 4 | 7 | Hook B: `kich-ban.md` dòng 11 và 20 ("bơm xong lốp lại xẹp, đồ thật, quay thật") so với `san-xuat.md` cảnh 1 (cho phép ghép 2 lần quay, thả hơi trước) | Kịch bản nói quay liền, shot list cho ghép. Làm cho lốp xẹp lại ngay trong 3 giây là khó, có nguy cơ quay hỏng hook. Bản ghép thì phải nhất quán, không để khán giả hiểu đây là sự cố thật của khách. | `kich-ban`: viết hook là cảnh dựng minh hoạ có chủ ý (lốp xẹp, thợ bơm, nhìn camera hỏi), bỏ chữ "quay thật" cho phần lốp xẹp lại, hoặc đổi thành cảnh dễ làm hơn: lốp xẹp nhìn thấy rõ, thợ bơm vài nhịp rồi chỉ vào lốp hỏi. `san-xuat` cập nhật cảnh 1 cho khớp. | `kich-ban` rồi `san-xuat` |
| 5 | 7 | `san-xuat.md` cảnh 4 và cảnh 3 | (a) Cảnh 4a ghi "7 giây dùng" nhưng lời thoại 4a trải suốt 9 giây (17–26s), cảnh 4b chỉ là hình chèn đè lên. (b) Cảnh 3 yêu cầu "ống đồng còn bọc bảo ôn, nhìn thấy rõ" mâu thuẫn: bảo ôn che ống đồng. | (a) Sửa thành "4a: 9 giây dùng (tiếng), 4b: 2 giây hình chèn đè lên". (b) Sửa thành "ống đồng bọc bảo ôn nhìn thấy rõ đường đi; nếu có đoạn ống đồng trần thì lấy cận cảnh đoạn đó". | `san-xuat` |

## Lưu ý (không tính lỗi, cần người duyệt xác nhận trước khi quay/đăng)

- Câu "Bên Anh Sơn kiểm tra rò rỉ trước, chỉ cho anh chị thấy, rồi mới tính chuyện nạp" và CTA "em kiểm tra rò rỉ trước khi nạp" là cam kết quy trình dịch vụ. Chủ cửa hàng phải xác nhận Anh Sơn thực sự làm như vậy với mọi khách. Không được ngầm hiểu là miễn phí; giá "Kiểm tra rò rỉ + nạp gas" còn `[ĐIỀN]` nên không nói giá trong video.
- Chữ trên ảnh bìa "Thợ báo 'hết gas'? Khoan gật đầu đã" và tiêu đề nội bộ "vẽ bệnh" mang sắc thái nghi ngờ thợ nói chung. Chưa chê đích danh nên chưa vi phạm, nhưng giữ giọng trung tính, không đăng tiêu đề "vẽ bệnh" ra ngoài.
- Các ô `[ĐIỀN]` vẫn còn (tên thợ và việc thợ đồng ý xuất hiện, tên Zalo OA, xác nhận xin phép chủ nhà). Giữ nguyên, báo người dùng; chưa được đăng khi chưa điền.
- Người duyệt phải xem cảnh 5 để chắc đây đúng thao tác thật của thợ trước khi đăng.

## Vòng kiểm duyệt
Vòng 1. Sau khi `kich-ban` và `san-xuat` sửa, chấm lại vòng 2 (tối đa 2 vòng).
