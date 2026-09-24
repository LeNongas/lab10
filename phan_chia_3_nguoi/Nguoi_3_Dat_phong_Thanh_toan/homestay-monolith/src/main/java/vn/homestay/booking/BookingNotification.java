package vn.homestay.booking;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.homestay.account.User;

@Entity
@Table(name = "booking_notifications")
@Getter @Setter @NoArgsConstructor
public class BookingNotification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User customer;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Booking booking;
    @Column(nullable = false, length = 700)
    private String message;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
