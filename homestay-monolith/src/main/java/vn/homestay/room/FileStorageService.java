package vn.homestay.room;

import java.io.IOException;
import java.nio.file.*;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
    @Value("${app.upload-dir:uploads}")
    private String uploadDir;
    private static final Set<String> EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    public String save(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Vui lòng chọn ảnh");
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = original.contains(".") ? original.substring(original.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT) : "";
        if (!EXTENSIONS.contains(extension) || file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");
        }
        Path folder = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(folder);
        String name = UUID.randomUUID() + "." + extension;
        try (var stream = file.getInputStream()) {
            Files.copy(stream, folder.resolve(name), StandardCopyOption.REPLACE_EXISTING);
        }
        return "/uploads/" + name;
    }
}
