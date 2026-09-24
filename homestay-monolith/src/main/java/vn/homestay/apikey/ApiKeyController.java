package vn.homestay.apikey;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/api-keys")
@RequiredArgsConstructor
public class ApiKeyController {
    private final ApiKeyService service;

    @GetMapping
    public List<ApiKeyDto.Response> all() { return service.all(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiKeyDto.Response create(@Valid @RequestBody ApiKeyDto.CreateRequest request) {
        return service.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable Long id) { service.revoke(id); }
}
