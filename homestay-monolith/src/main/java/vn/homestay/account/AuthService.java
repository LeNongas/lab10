package vn.homestay.account;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final SessionTokenRepository tokens;
    private final PasswordEncoder encoder;

    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        User user = users.findByUsername(request.username()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai tên đăng nhập hoặc mật khẩu"));
        if (!encoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai tên đăng nhập hoặc mật khẩu");
        }
        return createSession(user);
    }

    public AuthDto.LoginResponse register(AuthDto.RegisterRequest request) {
        String username = request.username().trim();
        if (username.length() < 3 || users.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException(username.length() < 3
                    ? "Tên đăng nhập cần ít nhất 3 ký tự" : "Tên đăng nhập đã tồn tại");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(request.password()));
        user.setRole("CUSTOMER");
        return createSession(users.save(user));
    }

    private AuthDto.LoginResponse createSession(User user) {
        SessionToken token = new SessionToken();
        token.setValue(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(LocalDateTime.now().plusDays(1));
        tokens.save(token);
        return new AuthDto.LoginResponse(user.getId(), token.getValue(), user.getUsername(), user.getRole());
    }
}
