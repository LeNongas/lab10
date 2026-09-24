package vn.homestay.booking;

import java.time.LocalDate;
import java.util.List;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findAllByOrderByCreatedAtDesc();
    boolean existsByRoomId(Long roomId);
    boolean existsByCustomerId(Long customerId);
    List<Booking> findByPaymentMethodAndBankAccountNumberIsNullAndStatusIn(String paymentMethod, Collection<String> statuses);
    List<Booking> findByRoomIdAndStatusInAndCheckOutAfter(Long roomId, Collection<String> statuses, LocalDate date);

    @Query("select b from Booking b where b.room.id = :roomId and b.status in ('PENDING', 'CONFIRMED') and b.checkIn < :checkOut and b.checkOut > :checkIn")
    List<Booking> findOverlapping(@Param("roomId") Long roomId, @Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut);

    @Query("select count(b) from Booking b where b.room.id = :roomId and b.status in ('PENDING', 'CONFIRMED') and b.checkIn < :checkOut and b.checkOut > :checkIn")
    long countOverlapping(@Param("roomId") Long roomId, @Param("checkIn") LocalDate checkIn,
                          @Param("checkOut") LocalDate checkOut);
}
