package vn.homestay.account;

import jakarta.validation.constraints.NotBlank;

public final class UserDto {
    private UserDto() {}
    public record Request(@NotBlank String username, String password, @NotBlank String role) {}
    public record Response(Long id, String username, String role) {}
}
