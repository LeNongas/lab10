package vn.homestay.room;

import java.util.List;
import org.springframework.data.domain.Page;

public record PagedRoomResponse(List<RoomDto.Response> content, long totalElements,
                                int totalPages, int number, int size) {
    public static PagedRoomResponse from(Page<RoomDto.Response> page) {
        return new PagedRoomResponse(page.getContent(), page.getTotalElements(),
                page.getTotalPages(), page.getNumber(), page.getSize());
    }
}
