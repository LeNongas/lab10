package vn.edu.crs.authservice.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(
            Long userId,
            String username,
            String role
    ) {
        Date now = new Date();
        Date expiry = new Date(
                System.currentTimeMillis() + expiration
        );

        return Jwts.builder()
                .setSubject(username)

                // Buổi 9: thêm userId vào JWT
                .claim("userId", userId)

                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }
}