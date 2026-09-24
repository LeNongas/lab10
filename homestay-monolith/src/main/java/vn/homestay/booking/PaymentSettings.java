package vn.homestay.booking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payment_settings")
@Getter @Setter @NoArgsConstructor
public class PaymentSettings {
    @Id
    private Long id = 1L;
    @Column(nullable = false)
    private Integer depositPercent;
    @Column(nullable = false, length = 100)
    private String bankName;
    @Column(nullable = false, length = 30)
    private String accountNumber;
    @Column(nullable = false, length = 100)
    private String accountHolder;
}
