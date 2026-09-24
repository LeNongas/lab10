# Đặt phòng homestay - Modular Monolith

Dự án áp dụng cấu trúc các bài SOS01-SOS10 trong bộ hướng dẫn: một ứng dụng Spring Boot, một cơ sở dữ liệu MySQL, các nhóm chức năng tách thành `account`, `room`, `booking`, `apikey` và `shared`. Mỗi nhóm có entity, repository, xử lý nghiệp vụ và API. Giao diện React nằm tại `../homestay-frontend`.

## Chạy trong IntelliJ IDEA

1. Bật MySQL. Cấu hình mặc định là `root` không có mật khẩu; có thể đặt `DB_URL`, `DB_USER`, `DB_PASSWORD` nếu máy dùng cấu hình khác.
2. Mở thư mục `homestay-monolith` trong IDEA với JDK 17. Chạy lớp `vn.homestay.HomestayApplication` hoặc chạy `./mvnw.cmd spring-boot:run` trong Terminal. Backend dùng cổng **8084**.
3. Mở thư mục `homestay-frontend` trong Terminal khác, chạy `npm install` nếu chưa cài thư viện, sau đó `npm run dev`. Giao diện ở `http://localhost:5173`.

CSDL `homestay_db` được tạo tự động; hệ thống thêm loại phòng, ba phòng mẫu, tài khoản `admin` / `admin123` và `guest1` / `guest12345` khi CSDL còn trống. Khách mới chọn **Đăng ký cho khách** tại trang đăng nhập (`/register`), nhập tên đăng nhập và mật khẩu từ 8 ký tự; đăng ký thành công sẽ tự đăng nhập với quyền `CUSTOMER`. API tương ứng là `POST /api/auth/register`. Mật khẩu có thể đổi qua API quản trị `/api/users/{id}`.

## Chức năng

- SOS01-SOS04: REST API, mô hình Controller → Service → Repository và lưu dữ liệu MySQL bằng Spring Data JPA.
- SOS05: loại phòng và phòng có quan hệ 1-N.
- SOS06: tài khoản, đăng nhập và phân quyền `ADMIN`/`CUSTOMER`; quản trị viên có thể tạo, sửa, xóa tài khoản tại `/admin/users` và đổi tên loại phòng tại `/admin/rooms`.
- SOS07: tìm kiếm, sắp xếp, phân trang và tải ảnh phòng.
- SOS08-SOS09: giao diện khách hàng và giao diện quản trị.
- SOS10: cấp API Key và xác thực header `X-API-KEY` cho API đối tác.

- Khách chọn ngày nhận, trả phòng và số khách; hệ thống hiển thị số phòng trống trong cả kỳ lưu trú, kiểm tra trùng lịch, sức chứa rồi tạo đơn `PENDING`. Đơn chờ xác nhận cũng giữ chỗ để tránh đặt trùng. Khách vào **Phòng đã đặt** để chọn **chuyển khoản đặt cọc** hoặc **thanh toán khi nhận phòng**, xem trạng thái và hủy đơn chưa thanh toán. Đơn đã nhận cọc hoặc thanh toán cần liên hệ quản trị viên nếu muốn hủy.
- Quản trị viên vào `/admin/bookings` để xác nhận đơn sau khi khách chọn cách thanh toán, rồi cập nhật trạng thái `UNPAID`, `DEPOSIT_PAID` hoặc `PAID`. Hệ thống lưu lựa chọn và trạng thái thanh toán; việc chuyển khoản thực tế được đối chiếu thủ công vì chưa kết nối ngân hàng hay cổng thanh toán.
- Quản trị viên cấu hình tỷ lệ cọc và tài khoản nhận tiền tại `/admin/payment-settings` trước khi khách chọn chuyển khoản. Hệ thống tính số tiền cọc theo tổng giá tại lúc tạo đơn, cấp mã nội dung `NEST<id đơn>`, và lưu thông tin ngân hàng vào đơn khi khách chọn chuyển khoản. Khách thấy số tiền, ngân hàng, số tài khoản, chủ tài khoản và nội dung chuyển khoản trong **Phòng đã đặt**; admin thấy tiền cọc và mã đối chiếu trong danh sách đơn. Thay đổi cấu hình sau này không đổi hướng dẫn chuyển khoản đã lưu cho đơn trước. Việc xác nhận đã nhận tiền vẫn do admin đối chiếu thủ công; hệ thống không tự chuyển tiền.
- Quản trị viên có thể từ chối đơn đang chờ hoặc hủy đơn đã xác nhận tại `/admin/bookings`; cả hai thao tác đều yêu cầu lý do và hiển thị lý do đó trong **Phòng đã đặt** của khách. Phòng được mở lại cho lượt đặt khác. Nếu đơn đã nhận cọc hoặc thanh toán, trạng thái chuyển sang `REFUND_PENDING`; sau khi hoàn tiền thủ công, quản trị viên đánh dấu `REFUNDED`.
- Khách thấy giá mỗi đêm và tổng tiền theo số đêm trước khi xác nhận. Giá được lưu cùng đơn đặt phòng để không thay đổi khi quản trị viên sửa giá phòng. Quản trị viên xem người đặt, phòng, thời gian, số khách, tổng tiền và trạng thái tại `/admin/bookings`.
- Mỗi đơn lưu họ tên, số điện thoại liên hệ và ghi chú nhận phòng do khách nhập khi đặt; quản trị viên xem các thông tin này cùng đơn, còn khách xem lại trong **Phòng đã đặt**.
- Khi quản trị viên xác nhận, từ chối, hủy hoặc cập nhật thanh toán, khách nhận thông báo trong tài khoản tại `/notifications`. Thông báo được lưu lại, có số lượng chưa đọc trên thanh điều hướng và có thể đánh dấu đã đọc.
- Quản trị viên vào `/admin/calendar` để xem lịch từng ngày: số phòng đã đặt, đang bảo trì và còn trống. Có thể khóa một hoặc nhiều phòng trong khoảng ngày bảo trì và bỏ khóa sau đó. Hệ thống không cho khóa vượt số phòng còn trống; lịch bảo trì cũng được tính vào khả dụng khi khách tìm và đặt phòng. Ngày kết thúc bảo trì được tính trong thời gian khóa.
- Đăng nhập bằng token. API Key chỉ hiện một lần khi tạo, được lưu dưới dạng băm; đối tác dùng quyền `rooms:read` để gọi `GET /api/partner/rooms`.

## Kiểm tra

Trong `homestay-monolith`, chạy `./mvnw.cmd test`. Bài kiểm tra tích hợp dùng H2 và bao phủ đăng ký khách, đăng nhập, quản trị tài khoản, tạo và sửa loại phòng, tìm kiếm, đặt phòng chờ xác nhận và thông tin liên hệ, chống trùng lịch kể cả nhiều phòng cùng loại, lịch bảo trì và quyền quản trị, tính tiền cọc và lưu thông tin chuyển khoản theo đơn, chọn cách thanh toán, quyền xác nhận, từ chối hoặc hủy đơn với lý do và trạng thái hoàn tiền, thông báo trong tài khoản khách, hủy phòng và API Key.

Giao diện gọi ứng dụng monolith tại cổng 8084.

Dữ liệu trong ba CSDL cũ được giữ nguyên. CSDL `homestay_db` mới dùng dữ liệu mẫu riêng; các lượt đăng ký cũ không có ngày nhận/trả phòng nên không được chuyển thành đơn đặt phòng của hệ thống mới.


---
GitHub repository: `trduluong`
