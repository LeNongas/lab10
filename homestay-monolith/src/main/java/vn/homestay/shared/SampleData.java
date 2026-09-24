package vn.homestay.shared;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.homestay.account.User;
import vn.homestay.account.UserRepository;
import vn.homestay.room.Room;
import vn.homestay.room.RoomCategory;
import vn.homestay.room.RoomCategoryRepository;
import vn.homestay.room.RoomRepository;

@Component
@RequiredArgsConstructor
public class SampleData implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final RoomCategoryRepository categories;
    private final RoomRepository rooms;

    @Override
    public void run(String... args) {
        createUser("admin", "admin123", "ADMIN");
        createUser("guest1", "guest12345", "CUSTOMER");
        if (categories.count() == 0 && rooms.count() == 0) {
            RoomCategory garden = category("Phòng vườn");
            RoomCategory view = category("Phòng ngắm cảnh");
            room("Phòng Mây Trắng", 2, 3, 650000, "Không gian yên tĩnh với cửa sổ nhìn ra núi.", view);
            room("Phòng Nắng Ban Mai", 3, 2, 790000, "Ban công đón nắng sớm và góc nghỉ ngơi ấm cúng.", garden);
            room("Phòng Trăng Dịu Êm", 2, 2, 720000, "Phòng nghỉ nhẹ nhàng, phù hợp cho chuyến đi thư giãn.", view);
        }
    }

    private void createUser(String username, String password, String role) {
        if (users.findByUsername(username).isPresent()) return;
        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(password));
        user.setRole(role);
        users.save(user);
    }

    private RoomCategory category(String name) {
        RoomCategory category = new RoomCategory();
        category.setName(name);
        return categories.save(category);
    }

    private void room(String name, int guests, int quantity, int price, String description, RoomCategory category) {
        Room room = new Room();
        room.setName(name);
        room.setMaxGuests(guests);
        room.setQuantity(quantity);
        room.setPricePerNight(BigDecimal.valueOf(price));
        room.setDescription(description);
        room.setCategory(category);
        rooms.save(room);
    }
}
