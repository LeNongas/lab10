package vn.homestay.room;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.homestay.booking.Booking;
import vn.homestay.booking.BookingAvailability;
import vn.homestay.booking.BookingRepository;

@Service
@RequiredArgsConstructor
public class RoomCalendarService {
    private final RoomRepository rooms;
    private final BookingRepository bookings;
    private final RoomBlockRepository blocks;

    @Transactional(readOnly = true)
    public RoomCalendarDto.Response calendar(String monthText) {
        YearMonth month;
        try {
            month = monthText == null ? YearMonth.now() : YearMonth.parse(monthText);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Tháng không hợp lệ");
        }
        LocalDate first = month.atDay(1);
        LocalDate endExclusive = month.plusMonths(1).atDay(1);
        List<RoomCalendarDto.RoomRow> rows = new ArrayList<>();
        List<RoomCalendarDto.BlockResponse> visibleBlocks = new ArrayList<>();
        for (Room room : rooms.findAll().stream().sorted(Comparator.comparing(Room::getName)).toList()) {
            List<Booking> roomBookings = bookings.findOverlapping(room.getId(), first, endExclusive);
            List<RoomBlock> roomBlocks = blocks.findOverlapping(room.getId(), first, endExclusive);
            roomBlocks.stream().map(this::response).forEach(visibleBlocks::add);
            List<RoomCalendarDto.Day> days = new ArrayList<>();
            for (LocalDate day = first; day.isBefore(endExclusive); day = day.plusDays(1)) {
                LocalDate current = day;
                int booked = (int) roomBookings.stream().filter(b -> !b.getCheckIn().isAfter(current)
                        && b.getCheckOut().isAfter(current)).count();
                int blocked = roomBlocks.stream().filter(b -> !b.getStartDate().isAfter(current)
                        && !b.getEndDate().isBefore(current)).mapToInt(RoomBlock::getUnits).sum();
                days.add(new RoomCalendarDto.Day(day, booked, blocked,
                        Math.max(0, room.getQuantity() - booked - blocked)));
            }
            rows.add(new RoomCalendarDto.RoomRow(room.getId(), room.getName(), room.getQuantity(), days));
        }
        visibleBlocks.sort(Comparator.comparing(RoomCalendarDto.BlockResponse::startDate)
                .thenComparing(RoomCalendarDto.BlockResponse::roomName));
        return new RoomCalendarDto.Response(month.toString(), rows, visibleBlocks);
    }

    @Transactional
    public RoomCalendarDto.BlockResponse create(RoomCalendarDto.BlockRequest request) {
        if (request.startDate().isBefore(LocalDate.now()) || request.endDate().isBefore(request.startDate())
                || request.endDate().equals(LocalDate.MAX)) {
            throw new IllegalArgumentException("Ngày bảo trì không hợp lệ");
        }
        if (request.reason().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập lý do bảo trì");
        }
        Room room = rooms.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phòng"));
        if (request.units() > room.getQuantity()) {
            throw new IllegalArgumentException("Số phòng bảo trì vượt quá số phòng hiện có");
        }
        RoomBlock block = new RoomBlock();
        block.setRoom(room);
        block.setStartDate(request.startDate());
        block.setEndDate(request.endDate());
        block.setUnits(request.units());
        block.setReason(request.reason().trim());
        LocalDate endExclusive = request.endDate().plusDays(1);
        List<RoomBlock> overlappingBlocks = new ArrayList<>(blocks.findOverlapping(room.getId(), request.startDate(), endExclusive));
        overlappingBlocks.add(block);
        int peak = BookingAvailability.peakOccupied(bookings.findOverlapping(room.getId(), request.startDate(), endExclusive),
                overlappingBlocks, request.startDate(), endExclusive);
        if (peak > room.getQuantity()) {
            throw new IllegalStateException("Khoảng ngày này đã có khách đặt hoặc phòng đang bảo trì");
        }
        return response(blocks.save(block));
    }

    @Transactional
    public void delete(Long id) {
        RoomBlock block = blocks.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy lịch bảo trì"));
        rooms.findByIdForUpdate(block.getRoom().getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phòng"));
        blocks.delete(block);
    }

    private RoomCalendarDto.BlockResponse response(RoomBlock block) {
        return new RoomCalendarDto.BlockResponse(block.getId(), block.getRoom().getId(),
                block.getRoom().getName(), block.getStartDate(), block.getEndDate(),
                block.getUnits(), block.getReason());
    }
}
