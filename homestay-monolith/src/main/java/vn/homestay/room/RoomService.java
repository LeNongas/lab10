package vn.homestay.room;

import java.time.LocalDate;
import java.io.IOException;
import java.util.TreeMap;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.homestay.booking.BookingRepository;
import vn.homestay.booking.BookingAvailability;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository rooms;
    private final RoomCategoryRepository categories;
    private final BookingRepository bookings;
    private final RoomBlockRepository blocks;
    private final FileStorageService files;

    public Page<RoomDto.Response> search(String keyword, Long categoryId, Pageable pageable) {
        return search(keyword, categoryId, null, null, pageable);
    }

    public Page<RoomDto.Response> search(String keyword, Long categoryId, LocalDate checkIn, LocalDate checkOut, Pageable pageable) {
        return search(keyword, categoryId, checkIn, checkOut, null, pageable);
    }

    public Page<RoomDto.Response> search(String keyword, Long categoryId, LocalDate checkIn, LocalDate checkOut,
                                         Integer guests, Pageable pageable) {
        return search(keyword, categoryId, checkIn, checkOut, guests, null, pageable);
    }

    public Page<RoomDto.Response> search(String keyword, Long categoryId, LocalDate checkIn, LocalDate checkOut,
                                         Integer guests, Long roomId, Pageable pageable) {
        if ((checkIn == null) != (checkOut == null)
                || (checkIn != null && (checkIn.isBefore(LocalDate.now()) || !checkOut.isAfter(checkIn)))) {
            throw new IllegalArgumentException("Ngày nhận và trả phòng không hợp lệ");
        }
        if (guests != null && guests < 1) {
            throw new IllegalArgumentException("Số khách phải lớn hơn 0");
        }
        if (roomId != null) {
            if (roomId < 1) throw new IllegalArgumentException("Mã phòng không hợp lệ");
            Room room = find(roomId);
            RoomDto.Response selected = toResponse(room, checkIn, checkOut);
            List<RoomDto.Response> matching = (guests == null || room.getMaxGuests() >= guests)
                    && (checkIn == null || selected.availableForStay() > 0)
                    ? List.of(selected) : List.of();
            int from = pageable.isPaged() ? (int) Math.min(pageable.getOffset(), matching.size()) : 0;
            int to = pageable.isPaged() ? Math.min(from + pageable.getPageSize(), matching.size()) : matching.size();
            return new PageImpl<>(matching.subList(from, to), pageable, matching.size());
        }
        String term = keyword == null || keyword.isBlank() ? null : keyword.trim();
        if (checkIn == null && guests == null) {
            return rooms.search(term, categoryId, pageable).map(room -> toResponse(room, null, null));
        }
        List<RoomDto.Response> matching = rooms.search(term, categoryId, Pageable.unpaged(pageable.getSort()))
                .stream()
                .filter(room -> guests == null || room.getMaxGuests() >= guests)
                .map(room -> toResponse(room, checkIn, checkOut))
                .filter(room -> checkIn == null || room.availableForStay() > 0)
                .toList();
        int from = pageable.isPaged() ? (int) Math.min(pageable.getOffset(), matching.size()) : 0;
        int to = pageable.isPaged() ? Math.min(from + pageable.getPageSize(), matching.size()) : matching.size();
        return new PageImpl<>(matching.subList(from, to), pageable, matching.size());
    }

    public RoomDto.Response get(Long id) { return toResponse(find(id)); }

    public Room find(Long id) {
        return rooms.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy phòng"));
    }

    public RoomDto.Response toResponse(Room room) {
        return toResponse(room, null, null);
    }

    private RoomDto.Response toResponse(Room room, LocalDate checkIn, LocalDate checkOut) {
        int left = BookingAvailability.minimumAvailable(room.getQuantity(),
                bookings.findOverlapping(room.getId(), LocalDate.now(), LocalDate.now().plusDays(1)),
                blocks.findOverlapping(room.getId(), LocalDate.now(), LocalDate.now().plusDays(1)),
                LocalDate.now(), LocalDate.now().plusDays(1));
        Integer availableForStay = checkIn == null ? null : BookingAvailability.minimumAvailable(room.getQuantity(),
                bookings.findOverlapping(room.getId(), checkIn, checkOut),
                blocks.findOverlapping(room.getId(), checkIn, checkOut), checkIn, checkOut);
        return new RoomDto.Response(room.getId(), room.getName(), room.getMaxGuests(), room.getQuantity(),
                left, availableForStay, room.getPricePerNight(), room.getDescription(), room.getImageUrl(),
                room.getCategory().getId(), room.getCategory().getName());
    }

    @Transactional
    public RoomDto.Response save(Long id, RoomDto.Request request) {
        Room room = id == null ? new Room() : rooms.findByIdForUpdate(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phòng"));
        rooms.findByNameIgnoreCase(request.name().trim()).ifPresent(existing -> {
            if (!existing.getId().equals(room.getId())) throw new IllegalArgumentException("Tên phòng đã tồn tại");
        });
        if (id != null) {
            TreeMap<LocalDate, Integer> changes = new TreeMap<>();
            bookings.findByRoomIdAndStatusInAndCheckOutAfter(id, List.of("PENDING", "CONFIRMED"), LocalDate.now())
                    .forEach(booking -> {
                        changes.merge(booking.getCheckIn(), 1, Integer::sum);
                        changes.merge(booking.getCheckOut(), -1, Integer::sum);
                    });
            blocks.findByRoomIdAndEndDateGreaterThanEqual(id, LocalDate.now()).forEach(block -> {
                changes.merge(block.getStartDate(), block.getUnits(), Integer::sum);
                changes.merge(block.getEndDate().plusDays(1), -block.getUnits(), Integer::sum);
            });
            int occupied = 0;
            for (int change : changes.values()) {
                occupied += change;
                if (occupied > request.quantity()) {
                    throw new IllegalArgumentException("Số phòng cho thuê nhỏ hơn số phòng đã đặt");
                }
            }
        }
        room.setName(request.name().trim());
        room.setMaxGuests(request.maxGuests());
        room.setQuantity(request.quantity());
        room.setPricePerNight(request.pricePerNight());
        room.setDescription(request.description());
        room.setCategory(categories.findById(request.categoryId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy loại phòng")));
        return toResponse(rooms.save(room));
    }

    public void delete(Long id) {
        Room room = find(id);
        if (bookings.existsByRoomId(id)) throw new IllegalStateException("Phòng đã có đơn đặt, không thể xóa");
        if (blocks.existsByRoomId(id)) throw new IllegalStateException("Phòng đã có lịch bảo trì, hãy xóa lịch trước");
        rooms.delete(room);
    }

    public RoomDto.Response upload(Long id, MultipartFile file) throws IOException {
        Room room = find(id);
        room.setImageUrl(files.save(file));
        return toResponse(rooms.save(room));
    }
}
