package com.example.registration_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String secret;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            try {

                // Tạo SecretKey từ jwt.secret
                SecretKey key = Keys.hmacShaKeyFor(
                        secret.getBytes(StandardCharsets.UTF_8)
                );

                // Đọc và xác thực JWT
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                String username = claims.getSubject();
                String role = claims.get("role", String.class);

                if (username != null) {

                    UsernamePasswordAuthenticationToken authentication;

                    if (role != null && !role.isBlank()) {

                        authentication =
                                new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        List.of(
                                                new SimpleGrantedAuthority(
                                                        "ROLE_" + role
                                                )
                                        )
                                );

                    } else {

                        authentication =
                                new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        List.of()
                                );
                    }

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }

            } catch (Exception e) {

                // Token lỗi / hết hạn / sai chữ ký
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}