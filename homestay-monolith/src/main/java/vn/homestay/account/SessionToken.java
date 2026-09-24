package vn.homestay.account;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "session_tokens")
@Getter @Setter @NoArgsConstructor
public class SessionToken {
    @Id @Column(name = "token_value", length = 64)
    private String value;
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private User user;
    @Column(nullable = false)
    private LocalDateTime expiresAt;
}
