package vn.homestay.booking;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.homestay.account.User;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class BookingNotificationController {
    private final BookingNotificationRepository notifications;

    public record NotificationResponse(Long id, Long bookingId, String message,
                                       LocalDateTime createdAt, LocalDateTime readAt) {}
    public record UnreadCount(long count) {}

    @GetMapping
    @Transactional(readOnly = true)
    public List<NotificationResponse> mine(@AuthenticationPrincipal User customer) {
        return notifications.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(this::response).toList();
    }

    @GetMapping("/unread-count")
    public UnreadCount unreadCount(@AuthenticationPrincipal User customer) {
        return new UnreadCount(notifications.countByCustomerIdAndReadAtIsNull(customer.getId()));
    }

    @PutMapping("/{id}/read")
    @Transactional
    public NotificationResponse markRead(@AuthenticationPrincipal User customer, @PathVariable Long id) {
        BookingNotification notification = notifications.findByIdAndCustomerId(id, customer.getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy thông báo"));
        if (notification.getReadAt() == null) notification.setReadAt(LocalDateTime.now());
        return response(notification);
    }

    private NotificationResponse response(BookingNotification notification) {
        return new NotificationResponse(notification.getId(), notification.getBooking().getId(),
                notification.getMessage(), notification.getCreatedAt(), notification.getReadAt());
    }
}
