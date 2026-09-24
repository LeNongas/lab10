package vn.homestay.booking;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.homestay.account.User;
import vn.homestay.room.Room;

@Entity
@Table(name = "bookings")
@Getter @Setter @NoArgsConstructor
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User customer;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Room room;
    @Column(nullable = false)
    private LocalDate checkIn;
    @Column(nullable = false)
    private LocalDate checkOut;
    @Column(nullable = false)
    private Integer guests;
    @Column(length = 100)
    private String guestFullName;
    @Column(length = 20)
    private String guestPhone;
    @Column(length = 500)
    private String checkInNote;
    @Column(precision = 12, scale = 2)
    private BigDecimal pricePerNight;
    @Column(precision = 14, scale = 2)
    private BigDecimal totalPrice;
    @Column(precision = 14, scale = 0)
    private BigDecimal depositAmount;
    private Integer depositPercent;
    @Column(length = 100)
    private String bankName;
    @Column(length = 30)
    private String bankAccountNumber;
    @Column(length = 100)
    private String bankAccountHolder;
    @Column(length = 30)
    private String transferReference;
    @Column(length = 30)
    private String paymentMethod;
    @Column(length = 20)
    private String paymentStatus;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(length = 500)
    private String statusReason;
    @Column(nullable = false)
    private LocalDateTime createdAt;
}
