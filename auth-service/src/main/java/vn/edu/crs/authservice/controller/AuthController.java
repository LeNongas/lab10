package vn.edu.crs.authservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import vn.edu.crs.authservice.dto.AuthResponse;
import vn.edu.crs.authservice.dto.LoginRequest;
import vn.edu.crs.authservice.entity.User;
import vn.edu.crs.authservice.repository.UserRepository;
import vn.edu.crs.authservice.util.JwtUtil;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElse(null);

        if (
                user == null ||
                        !passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword()
                        )
        ) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Tài khoản hoặc mật khẩu không chính xác");
        }

        // Buổi 9: truyền thêm userId vào JWT
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );

        // Buổi 9: response trả thêm userId cho Frontend
        AuthResponse response = new AuthResponse(
                user.getId(),
                token,
                user.getUsername(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }
}