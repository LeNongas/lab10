package vn.homestay.room;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;

    @GetMapping
    public List<CategoryDto.Response> all() { return service.all(); }

    @GetMapping("/{id}")
    public CategoryDto.Response get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryDto.Response create(@Valid @RequestBody CategoryDto.Request request) {
        return service.save(null, request);
    }

    @PutMapping("/{id}")
    public CategoryDto.Response update(@PathVariable Long id, @Valid @RequestBody CategoryDto.Request request) {
        return service.save(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
