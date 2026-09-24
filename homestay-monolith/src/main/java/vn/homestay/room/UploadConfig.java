package vn.homestay.room;

import java.nio.file.Paths;
import java.nio.file.Files;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadConfig implements WebMvcConfigurer {
    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        var folder = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(folder);
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể tạo thư mục ảnh", ex);
        }
        String location = folder.toUri().toString();
        if (!location.endsWith("/")) location += "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
