package vn.homestay.apikey;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import vn.homestay.room.PagedRoomResponse;
import vn.homestay.room.RoomService;

@RestController
@RequestMapping("/api/partner/rooms")
@RequiredArgsConstructor
public class PartnerRoomController {
    private final ApiKeyService keys;
    private final RoomService rooms;

    @GetMapping
    public PagedRoomResponse list(@RequestHeader(value = "X-API-KEY", required = false) String key,
                                        @RequestParam(required = false) String keyword, Pageable pageable) {
        if (!keys.isValid(key, "rooms:read")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "API Key không hợp lệ");
        }
        return PagedRoomResponse.from(rooms.search(keyword, null, pageable));
    }
}
