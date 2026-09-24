package vn.homestay.account;

import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.homestay.booking.BookingRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository users;
    private final BookingRepository bookings;
    private final SessionTokenRepository tokens;
    private final PasswordEncoder encoder;

    public List<UserDto.Response> all() { return users.findAll().stream().map(this::response).toList(); }
    public UserDto.Response get(Long id) { return response(find(id)); }

    public UserDto.Response create(UserDto.Request request) {
        if (request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập mật khẩu");
        }
        return save(new User(), request);
    }

    public UserDto.Response update(User admin, Long id, UserDto.Request request) {
        if (admin.getId().equals(id) && !"ADMIN".equals(request.role())) {
            throw new IllegalStateException("Không thể đổi vai trò của tài khoản đang đăng nhập");
        }
        return save(find(id), request);
    }

    @Transactional
    public void delete(User admin, Long id) {
        if (admin.getId().equals(id)) throw new IllegalStateException("Không thể xóa tài khoản đang đăng nhập");
        if (bookings.existsByCustomerId(id)) throw new IllegalStateException("Tài khoản đã có đơn đặt phòng");
        User user = find(id);
        tokens.deleteByUserId(id);
        users.delete(user);
    }

    private UserDto.Response save(User user, UserDto.Request request) {
        if (!request.role().equals("ADMIN") && !request.role().equals("CUSTOMER")) {
            throw new IllegalArgumentException("Vai trò không hợp lệ");
        }
        if (request.username().trim().length() < 3) throw new IllegalArgumentException("Tên đăng nhập cần ít nhất 3 ký tự");
        if (request.password() != null && !request.password().isBlank() && request.password().length() < 8) {
            throw new IllegalArgumentException("Mật khẩu cần ít nhất 8 ký tự");
        }
        users.findByUsernameIgnoreCase(request.username().trim()).ifPresent(existing -> {
            if (!existing.getId().equals(user.getId())) throw new IllegalArgumentException("Tên đăng nhập đã tồn tại");
        });
        user.setUsername(request.username().trim());
        user.setRole(request.role());
        if (request.password() != null && !request.password().isBlank()) user.setPassword(encoder.encode(request.password()));
        return response(users.save(user));
    }

    private User find(Long id) { return users.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản")); }
    private UserDto.Response response(User user) { return new UserDto.Response(user.getId(), user.getUsername(), user.getRole()); }
}
