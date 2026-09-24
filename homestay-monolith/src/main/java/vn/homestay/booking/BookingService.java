package vn.homestay.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.homestay.account.User;
import vn.homestay.room.Room;
import vn.homestay.room.RoomRepository;
import vn.homestay.room.RoomBlockRepository;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookings;
    private final RoomRepository rooms;
    private final RoomBlockRepository blocks;
    private final BookingNotificationRepository notifications;
    private final PaymentSettingsRepository paymentSettings;

    @Transactional(readOnly = true)
    public List<BookingDto.Response> mine(User customer) {
        return bookings.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingDto.Response> all() {
        return bookings.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BookingDto.PaymentOptions paymentOptions() {
        return paymentSettings.findById(1L)
                .map(config -> new BookingDto.PaymentOptions(true, config.getDepositPercent()))
                .orElse(new BookingDto.PaymentOptions(false, 30));
    }

    @Transactional
    public BookingDto.Response create(User customer, BookingDto.Request request) {
        if (request.checkIn().isBefore(LocalDate.now()) || !request.checkOut().isAfter(request.checkIn())) {
            throw new IllegalArgumentException("Ngày nhận và trả phòng không hợp lệ");
        }
        Room room = rooms.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phòng"));
        if (request.guests() > room.getMaxGuests()) {
            throw new IllegalArgumentException("Số khách vượt quá sức chứa phòng");
        }
        String guestName = request.guestFullName().trim();
        String phone = request.guestPhone().trim();
        long digitCount = phone.chars().filter(Character::isDigit).count();
        if (digitCount < 9 || digitCount > 15 || !phone.matches("[0-9+().\\s-]+")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ");
        }
        if (BookingAvailability.minimumAvailable(room.getQuantity(),
                bookings.findOverlapping(room.getId(), request.checkIn(), request.checkOut()),
                blocks.findOverlapping(room.getId(), request.checkIn(), request.checkOut()),
                request.checkIn(), request.checkOut()) == 0) {
            throw new IllegalStateException("Phòng đã kín trong thời gian đã chọn");
        }
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setRoom(room);
        booking.setCheckIn(request.checkIn());
        booking.setCheckOut(request.checkOut());
        booking.setGuests(request.guests());
        booking.setGuestFullName(guestName);
        booking.setGuestPhone(phone);
        booking.setCheckInNote(request.checkInNote() == null ? null : request.checkInNote().trim());
        booking.setPricePerNight(room.getPricePerNight());
        booking.setTotalPrice(room.getPricePerNight().multiply(
                java.math.BigDecimal.valueOf(ChronoUnit.DAYS.between(request.checkIn(), request.checkOut()))));
        int percent = paymentSettings.findById(1L).map(PaymentSettings::getDepositPercent).orElse(30);
        booking.setDepositPercent(percent);
        booking.setDepositAmount(calculateDeposit(booking.getTotalPrice(), percent));
        booking.setStatus("PENDING");
        booking.setPaymentStatus("UNPAID");
        booking.setCreatedAt(LocalDateTime.now());
        Booking saved = bookings.save(booking);
        saved.setTransferReference("NEST" + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public BookingDto.Response choosePayment(User customer, Long id, BookingDto.PaymentChoice request) {
        Booking booking = find(id);
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new NoSuchElementException("Không tìm thấy đặt phòng");
        }
        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalStateException("Chỉ chọn thanh toán cho đơn chờ xác nhận");
        }
        if (!"UNPAID".equals(booking.getPaymentStatus())) {
            throw new IllegalStateException("Không thể đổi cách thanh toán sau khi đã trả tiền");
        }
        if (!List.of("BANK_TRANSFER_DEPOSIT", "PAY_AT_CHECKIN").contains(request.method())) {
            throw new IllegalArgumentException("Cách thanh toán không hợp lệ");
        }
        if ("BANK_TRANSFER_DEPOSIT".equals(request.method())) {
            if (!"BANK_TRANSFER_DEPOSIT".equals(booking.getPaymentMethod()) || booking.getBankAccountNumber() == null) {
                PaymentSettings config = paymentSettings.findById(1L)
                        .orElseThrow(() -> new IllegalStateException("Chưa có thông tin chuyển khoản. Vui lòng chọn thanh toán khi nhận phòng hoặc liên hệ quản trị viên"));
                if (booking.getDepositAmount() == null && booking.getTotalPrice() != null) {
                    booking.setDepositPercent(config.getDepositPercent());
                    booking.setDepositAmount(calculateDeposit(booking.getTotalPrice(), config.getDepositPercent()));
                }
                booking.setBankName(config.getBankName());
                booking.setBankAccountNumber(config.getAccountNumber());
                booking.setBankAccountHolder(config.getAccountHolder());
            }
            if (booking.getTransferReference() == null) booking.setTransferReference("NEST" + booking.getId());
        } else {
            booking.setBankName(null);
            booking.setBankAccountNumber(null);
            booking.setBankAccountHolder(null);
        }
        booking.setPaymentMethod(request.method());
        return toResponse(booking);
    }

    @Transactional
    public BookingDto.Response confirm(Long id) {
        Booking booking = find(id);
        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalStateException("Chỉ xác nhận đơn đang chờ");
        }
        if (booking.getPaymentMethod() == null) {
            throw new IllegalStateException("Khách chưa chọn cách thanh toán");
        }
        booking.setStatus("CONFIRMED");
        notifyCustomer(booking, "Đơn #" + booking.getId() + " cho phòng " + booking.getRoom().getName() + " đã được xác nhận.");
        return toResponse(booking);
    }

    @Transactional
    public BookingDto.Response reject(Long id, BookingDto.AdminDecision request) {
        Booking booking = find(id);
        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalStateException("Chỉ từ chối đơn đang chờ xác nhận");
        }
        return closeByAdmin(booking, "REJECTED", request.reason());
    }

    @Transactional
    public BookingDto.Response cancelByAdmin(Long id, BookingDto.AdminDecision request) {
        Booking booking = find(id);
        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new IllegalStateException("Chỉ hủy đơn đã xác nhận");
        }
        return closeByAdmin(booking, "CANCELLED", request.reason());
    }

    private BookingDto.Response closeByAdmin(Booking booking, String status, String reason) {
        String trimmed = reason.trim();
        if (trimmed.isEmpty()) throw new IllegalArgumentException("Vui lòng nhập lý do");
        booking.setStatus(status);
        booking.setStatusReason(trimmed);
        if ("DEPOSIT_PAID".equals(booking.getPaymentStatus()) || "PAID".equals(booking.getPaymentStatus())) {
            booking.setPaymentStatus("REFUND_PENDING");
        }
        notifyCustomer(booking, "Đơn #" + booking.getId() + " cho phòng " + booking.getRoom().getName()
                + ("REJECTED".equals(status) ? " đã bị từ chối. " : " đã bị hủy. ") + "Lý do: " + trimmed);
        return toResponse(booking);
    }

    @Transactional
    public BookingDto.Response updatePayment(Long id, BookingDto.PaymentUpdate request) {
        Booking booking = find(id);
        if (List.of("CANCELLED", "REJECTED").contains(booking.getStatus())) {
            if (!"REFUND_PENDING".equals(booking.getPaymentStatus()) || !"REFUNDED".equals(request.status())) {
                throw new IllegalStateException("Đơn đã đóng chỉ có thể cập nhật thành đã hoàn tiền");
            }
            booking.setPaymentStatus("REFUNDED");
            notifyCustomer(booking, "Đơn #" + booking.getId() + " cho phòng " + booking.getRoom().getName() + " đã được hoàn tiền.");
            return toResponse(booking);
        }
        if (booking.getPaymentMethod() == null) {
            throw new IllegalStateException("Khách chưa chọn cách thanh toán");
        }
        if (!List.of("UNPAID", "DEPOSIT_PAID", "PAID").contains(request.status())) {
            throw new IllegalArgumentException("Trạng thái thanh toán không hợp lệ");
        }
        if ("DEPOSIT_PAID".equals(request.status()) && !"BANK_TRANSFER_DEPOSIT".equals(booking.getPaymentMethod())) {
            throw new IllegalArgumentException("Chỉ đơn chuyển khoản đặt cọc mới có trạng thái đã đặt cọc");
        }
        if (!request.status().equals(booking.getPaymentStatus())) {
            booking.setPaymentStatus(request.status());
            String label = switch (request.status()) {
                case "DEPOSIT_PAID" -> "đã nhận tiền cọc";
                case "PAID" -> "đã thanh toán";
                default -> "chưa thanh toán";
            };
            notifyCustomer(booking, "Thanh toán đơn #" + booking.getId() + " cho phòng "
                    + booking.getRoom().getName() + ": " + label + ".");
        }
        return toResponse(booking);
    }

    @Transactional
    public void cancel(User customer, Long id) {
        Booking booking = find(id);
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new NoSuchElementException("Không tìm thấy đặt phòng");
        }
        if (List.of("CANCELLED", "REJECTED").contains(booking.getStatus())) {
            throw new IllegalStateException("Đặt phòng đã được hủy");
        }
        if (!"UNPAID".equals(booking.getPaymentStatus())) {
            throw new IllegalStateException("Đơn đã thanh toán hoặc đặt cọc, vui lòng liên hệ quản trị viên để hủy");
        }
        booking.setStatus("CANCELLED");
        booking.setStatusReason(null);
    }

    private Booking find(Long id) {
        return bookings.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy đặt phòng"));
    }

    private void notifyCustomer(Booking booking, String message) {
        BookingNotification notification = new BookingNotification();
        notification.setCustomer(booking.getCustomer());
        notification.setBooking(booking);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        notifications.save(notification);
    }

    static BigDecimal calculateDeposit(BigDecimal totalPrice, int percent) {
        return totalPrice.multiply(BigDecimal.valueOf(percent))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
    }

    private BookingDto.Response toResponse(Booking booking) {
        return new BookingDto.Response(booking.getId(), booking.getCustomer().getId(),
                booking.getCustomer().getUsername(),
                booking.getRoom().getId(), booking.getRoom().getName(), booking.getStatus(), booking.getStatusReason(),
                booking.getCreatedAt(), booking.getCheckIn(), booking.getCheckOut(), booking.getGuests(),
                booking.getGuestFullName(), booking.getGuestPhone(), booking.getCheckInNote(),
                booking.getPricePerNight(), booking.getTotalPrice(), booking.getDepositAmount(), booking.getDepositPercent(),
                booking.getBankName(), booking.getBankAccountNumber(), booking.getBankAccountHolder(),
                booking.getTransferReference(), booking.getPaymentMethod(),
                booking.getPaymentStatus() == null ? "UNPAID" : booking.getPaymentStatus());
    }
}
