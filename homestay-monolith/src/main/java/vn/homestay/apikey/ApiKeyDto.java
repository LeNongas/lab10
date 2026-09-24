package vn.homestay.apikey;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public final class ApiKeyDto {
    private ApiKeyDto() {}
    public record CreateRequest(@NotBlank String ownerName, @NotBlank String scopes, Integer validDays) {}
    public record Response(Long id, String keyValue, String ownerName, String scopes,
                           String status, LocalDateTime expiresAt, LocalDateTime createdAt) {}
}
