package vn.homestay.apikey;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApiKeyService {
    private final ApiKeyRepository keys;

    public List<ApiKeyDto.Response> all() { return keys.findAll().stream().map(k -> response(k, null)).toList(); }

    public ApiKeyDto.Response create(ApiKeyDto.CreateRequest request) {
        if (request.validDays() != null && request.validDays() < 1) {
            throw new IllegalArgumentException("Số ngày hiệu lực phải lớn hơn 0");
        }
        String raw = UUID.randomUUID() + "-" + UUID.randomUUID();
        ApiKey key = new ApiKey();
        key.setKeyHash(hash(raw));
        key.setOwnerName(request.ownerName().trim());
        key.setScopes(request.scopes().trim());
        key.setStatus("ACTIVE");
        key.setCreatedAt(LocalDateTime.now());
        key.setExpiresAt(request.validDays() == null ? null : LocalDateTime.now().plusDays(request.validDays()));
        return response(keys.save(key), raw);
    }

    public void revoke(Long id) {
        ApiKey key = keys.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy API Key"));
        key.setStatus("REVOKED");
        keys.save(key);
    }

    public boolean isValid(String raw, String scope) {
        if (raw == null || raw.isBlank()) return false;
        return keys.findByKeyHash(hash(raw)).filter(k -> k.getStatus().equals("ACTIVE"))
                .filter(k -> k.getExpiresAt() == null || k.getExpiresAt().isAfter(LocalDateTime.now()))
                .filter(k -> List.of(k.getScopes().split(",")).stream().map(String::trim).anyMatch(scope::equals))
                .isPresent();
    }

    private ApiKeyDto.Response response(ApiKey key, String raw) {
        return new ApiKeyDto.Response(key.getId(), raw, key.getOwnerName(), key.getScopes(),
                key.getStatus(), key.getExpiresAt(), key.getCreatedAt());
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
}
