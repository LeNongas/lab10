package vn.homestay.room;

import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final RoomCategoryRepository categories;
    private final RoomRepository rooms;

    public List<CategoryDto.Response> all() {
        return categories.findAll().stream().map(c -> new CategoryDto.Response(c.getId(), c.getName())).toList();
    }

    public CategoryDto.Response get(Long id) {
        RoomCategory category = find(id);
        return new CategoryDto.Response(category.getId(), category.getName());
    }

    public CategoryDto.Response save(Long id, CategoryDto.Request request) {
        RoomCategory category = id == null ? new RoomCategory() : find(id);
        categories.findByNameIgnoreCase(request.name().trim()).ifPresent(existing -> {
            if (!existing.getId().equals(category.getId())) throw new IllegalArgumentException("Loại phòng đã tồn tại");
        });
        category.setName(request.name().trim());
        RoomCategory saved = categories.save(category);
        return new CategoryDto.Response(saved.getId(), saved.getName());
    }

    public void delete(Long id) {
        RoomCategory category = find(id);
        if (rooms.existsByCategoryId(id)) throw new IllegalStateException("Loại phòng đang được sử dụng");
        categories.delete(category);
    }

    private RoomCategory find(Long id) {
        return categories.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy loại phòng"));
    }
}
