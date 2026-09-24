package vn.homestay.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class BookingDto {
    private BookingDto() {}

    public record Request(@NotNull Long roomId, @NotNull LocalDate checkIn,
                          @NotNull LocalDate checkOut, @NotNull @Min(1) Integer guests,
                          @NotBlank @Size(max = 100) String guestFullName,
                          @NotBlank @Size(max = 20) String guestPhone,
                          @Size(max = 500) String checkInNote) {}
    public record PaymentChoice(@NotBlank String method) {}
    public record PaymentUpdate(@NotBlank String status) {}
    public record AdminDecision(@NotBlank @Size(max = 500) String reason) {}
    public record PaymentOptions(boolean bankTransferAvailable, int depositPercent) {}
    public record Response(Long id, Long customerId, String customerName, Long roomId, String roomName,
                           String status, String statusReason, LocalDateTime createdAt, LocalDate checkIn,
                           LocalDate checkOut, Integer guests, String guestFullName, String guestPhone,
                           String checkInNote, BigDecimal pricePerNight,
                           BigDecimal totalPrice, BigDecimal depositAmount, Integer depositPercent,
                           String bankName, String bankAccountNumber, String bankAccountHolder,
                           String transferReference, String paymentMethod, String paymentStatus) {}
}
