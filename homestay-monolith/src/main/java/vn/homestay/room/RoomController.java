package vn.homestay.room;

import jakarta.validation.Valid;
import java.io.IOException;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService service;

    @GetMapping
    public PagedRoomResponse search(@RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) Long categoryId,
                                          @RequestParam(required = false) LocalDate checkIn,
                                          @RequestParam(required = false) LocalDate checkOut,
                                          @RequestParam(required = false) Integer guests,
                                          @RequestParam(required = false) Long roomId, Pageable pageable) {
        return PagedRoomResponse.from(service.search(keyword, categoryId, checkIn, checkOut, guests, roomId, pageable));
    }

    @GetMapping("/{id}")
    public RoomDto.Response get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomDto.Response create(@Valid @RequestBody RoomDto.Request request) { return service.save(null, request); }

    @PutMapping("/{id}")
    public RoomDto.Response update(@PathVariable Long id, @Valid @RequestBody RoomDto.Request request) {
        return service.save(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }

    @PostMapping("/{id}/upload-image")
    public RoomDto.Response upload(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        return service.upload(id, file);
    }
}
