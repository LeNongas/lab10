package vn.homestay.account;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    @GetMapping
    public List<UserDto.Response> all() { return service.all(); }

    @GetMapping("/{id}")
    public UserDto.Response get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto.Response create(@Valid @RequestBody UserDto.Request request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public UserDto.Response update(@AuthenticationPrincipal User admin, @PathVariable Long id,
                                   @Valid @RequestBody UserDto.Request request) {
        return service.update(admin, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal User admin, @PathVariable Long id) {
        service.delete(admin, id);
    }
}
