package vn.homestay.booking;

import java.time.LocalDate;
import java.util.List;
import java.util.TreeMap;
import vn.homestay.room.RoomBlock;

public final class BookingAvailability {
    private BookingAvailability() {}

    public static int minimumAvailable(int quantity, List<Booking> bookings, LocalDate checkIn, LocalDate checkOut) {
        return minimumAvailable(quantity, bookings, List.of(), checkIn, checkOut);
    }

    public static int minimumAvailable(int quantity, List<Booking> bookings, List<RoomBlock> blocks,
                                       LocalDate checkIn, LocalDate checkOut) {
        return Math.max(0, quantity - peakOccupied(bookings, blocks, checkIn, checkOut));
    }

    public static int peakOccupied(List<Booking> bookings, List<RoomBlock> blocks,
                                   LocalDate checkIn, LocalDate checkOut) {
        TreeMap<LocalDate, Integer> changes = new TreeMap<>();
        for (Booking booking : bookings) {
            add(changes, booking.getCheckIn(), booking.getCheckOut(), 1, checkIn, checkOut);
        }
        for (RoomBlock block : blocks) {
            add(changes, block.getStartDate(), block.getEndDate().plusDays(1), block.getUnits(), checkIn, checkOut);
        }
        int occupied = 0;
        int peak = 0;
        for (int change : changes.values()) {
            occupied += change;
            peak = Math.max(peak, occupied);
        }
        return peak;
    }

    private static void add(TreeMap<LocalDate, Integer> changes, LocalDate from, LocalDate to, int units,
                            LocalDate checkIn, LocalDate checkOut) {
        LocalDate start = from.isBefore(checkIn) ? checkIn : from;
        LocalDate end = to.isAfter(checkOut) ? checkOut : to;
        if (start.isBefore(end)) {
            changes.merge(start, units, Integer::sum);
            changes.merge(end, -units, Integer::sum);
        }
    }
}
