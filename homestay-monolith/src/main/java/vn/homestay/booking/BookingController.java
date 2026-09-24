package vn.homestay.booking;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.homestay.account.User;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService service;

    @GetMapping("/my")
    public List<BookingDto.Response> mine(@AuthenticationPrincipal User customer) {
        return service.mine(customer);
    }

    @GetMapping("/admin")
    public List<BookingDto.Response> all() {
        return service.all();
    }

    @GetMapping("/payment-options")
    public BookingDto.PaymentOptions paymentOptions() { return service.paymentOptions(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingDto.Response create(@AuthenticationPrincipal User customer,
                                      @Valid @RequestBody BookingDto.Request request) {
        return service.create(customer, request);
    }

    @PutMapping("/{id}/payment-method")
    public BookingDto.Response choosePayment(@AuthenticationPrincipal User customer, @PathVariable Long id,
                                             @Valid @RequestBody BookingDto.PaymentChoice request) {
        return service.choosePayment(customer, id, request);
    }

    @PutMapping("/admin/{id}/confirm")
    public BookingDto.Response confirm(@PathVariable Long id) {
        return service.confirm(id);
    }

    @PutMapping("/admin/{id}/reject")
    public BookingDto.Response reject(@PathVariable Long id, @Valid @RequestBody BookingDto.AdminDecision request) {
        return service.reject(id, request);
    }

    @PutMapping("/admin/{id}/cancel")
    public BookingDto.Response cancelByAdmin(@PathVariable Long id, @Valid @RequestBody BookingDto.AdminDecision request) {
        return service.cancelByAdmin(id, request);
    }

    @PutMapping("/admin/{id}/payment")
    public BookingDto.Response updatePayment(@PathVariable Long id,
                                             @Valid @RequestBody BookingDto.PaymentUpdate request) {
        return service.updatePayment(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@AuthenticationPrincipal User customer, @PathVariable Long id) {
        service.cancel(customer, id);
    }
}
