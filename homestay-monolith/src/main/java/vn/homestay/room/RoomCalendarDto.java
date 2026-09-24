package vn.homestay.room;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public final class RoomCalendarDto {
    private RoomCalendarDto() {}

    public record BlockRequest(@NotNull Long roomId, @NotNull LocalDate startDate,
                               @NotNull LocalDate endDate, @NotNull @Min(1) Integer units,
                               @NotBlank String reason) {}
    public record BlockResponse(Long id, Long roomId, String roomName, LocalDate startDate,
                                LocalDate endDate, Integer units, String reason) {}
    public record Day(LocalDate date, int booked, int blocked, int available) {}
    public record RoomRow(Long roomId, String roomName, int quantity, List<Day> days) {}
    public record Response(String month, List<RoomRow> rooms, List<BlockResponse> blocks) {}
}
