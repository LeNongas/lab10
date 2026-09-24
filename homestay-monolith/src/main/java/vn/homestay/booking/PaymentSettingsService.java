package vn.homestay.booking;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentSettingsService {
    private final PaymentSettingsRepository settings;
    private final BookingRepository bookings;

    @Transactional(readOnly = true)
    public PaymentSettingsController.Response get() {
        return settings.findById(1L).map(this::response)
                .orElse(new PaymentSettingsController.Response(30, "", "", "", false));
    }

    @Transactional
    public PaymentSettingsController.Response update(PaymentSettingsController.Request request) {
        PaymentSettings config = settings.findById(1L).orElseGet(PaymentSettings::new);
        config.setDepositPercent(request.depositPercent());
        config.setBankName(request.bankName().trim());
        config.setAccountNumber(request.accountNumber().trim());
        config.setAccountHolder(request.accountHolder().trim());
        settings.save(config);
        for (Booking booking : bookings.findByPaymentMethodAndBankAccountNumberIsNullAndStatusIn(
                "BANK_TRANSFER_DEPOSIT", List.of("PENDING", "CONFIRMED"))) {
            booking.setBankName(config.getBankName());
            booking.setBankAccountNumber(config.getAccountNumber());
            booking.setBankAccountHolder(config.getAccountHolder());
            if (booking.getTransferReference() == null) booking.setTransferReference("NEST" + booking.getId());
            if (booking.getDepositAmount() == null && booking.getTotalPrice() != null) {
                booking.setDepositPercent(config.getDepositPercent());
                booking.setDepositAmount(BookingService.calculateDeposit(booking.getTotalPrice(), config.getDepositPercent()));
            }
        }
        return response(config);
    }

    private PaymentSettingsController.Response response(PaymentSettings config) {
        return new PaymentSettingsController.Response(config.getDepositPercent(), config.getBankName(),
                config.getAccountNumber(), config.getAccountHolder(), true);
    }
}
