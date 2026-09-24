package vn.homestay.apikey;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "api_keys")
@Getter @Setter @NoArgsConstructor
public class ApiKey {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 64)
    private String keyHash;
    @Column(nullable = false)
    private String ownerName;
    @Column(nullable = false)
    private String scopes;
    @Column(nullable = false)
    private String status;
    private LocalDateTime expiresAt;
    @Column(nullable = false)
    private LocalDateTime createdAt;
}
