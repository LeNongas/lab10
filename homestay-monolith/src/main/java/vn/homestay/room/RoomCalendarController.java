package vn.homestay.room;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/calendar")
@RequiredArgsConstructor
public class RoomCalendarController {
    private final RoomCalendarService service;

    @GetMapping
    public RoomCalendarDto.Response calendar(@RequestParam(required = false) String month) {
        return service.calendar(month);
    }

    @PostMapping("/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomCalendarDto.BlockResponse create(@Valid @RequestBody RoomCalendarDto.BlockRequest request) {
        return service.create(request);
    }

    @DeleteMapping("/blocks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
