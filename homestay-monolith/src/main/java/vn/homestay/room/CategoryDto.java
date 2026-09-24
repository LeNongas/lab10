package vn.homestay.room;

import jakarta.validation.constraints.NotBlank;

public final class CategoryDto {
    private CategoryDto() {}
    public record Request(@NotBlank String name) {}
    public record Response(Long id, String name) {}
}
