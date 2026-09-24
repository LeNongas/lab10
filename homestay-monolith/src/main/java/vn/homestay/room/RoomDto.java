package vn.homestay.room;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public final class RoomDto {
    private RoomDto() {}

    public record Request(
            @NotBlank(message = "Tên phòng không được để trống") String name,
            @NotNull @Min(value = 1, message = "Số khách tối đa phải lớn hơn 0") Integer maxGuests,
            @NotNull @Min(value = 1, message = "Số phòng cho thuê phải lớn hơn 0") Integer quantity,
            @NotNull @DecimalMin(value = "0.01", message = "Giá phòng phải lớn hơn 0") BigDecimal pricePerNight,
            String description,
            @NotNull(message = "Vui lòng chọn loại phòng") Long categoryId) {}

    public record Response(Long id, String name, Integer maxGuests, Integer quantity,
                           Integer availableToday, Integer availableForStay,
                           BigDecimal pricePerNight, String description,
                           String imageUrl, Long categoryId, String categoryName) {}
}
