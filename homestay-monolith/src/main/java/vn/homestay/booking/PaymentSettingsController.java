package vn.homestay.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/payment-settings")
@RequiredArgsConstructor
public class PaymentSettingsController {
    private final PaymentSettingsService service;

    public record Request(@NotNull @Min(1) @Max(100) Integer depositPercent,
                          @NotBlank @Size(max = 100) String bankName,
                          @NotBlank @Pattern(regexp = "[0-9]{6,30}", message = "Số tài khoản cần có 6–30 chữ số") String accountNumber,
                          @NotBlank @Size(max = 100) String accountHolder) {}
    public record Response(int depositPercent, String bankName, String accountNumber,
                           String accountHolder, boolean configured) {}

    @GetMapping
    public Response get() { return service.get(); }

    @PutMapping
    public Response update(@Valid @RequestBody Request request) { return service.update(request); }
}
