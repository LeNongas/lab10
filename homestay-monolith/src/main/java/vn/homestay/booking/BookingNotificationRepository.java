package vn.homestay.booking;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingNotificationRepository extends JpaRepository<BookingNotification, Long> {
    List<BookingNotification> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    long countByCustomerIdAndReadAtIsNull(Long customerId);
    Optional<BookingNotification> findByIdAndCustomerId(Long id, Long customerId);
}
