package vn.homestay.shared;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.homestay.account.SessionTokenRepository;

@Component
@RequiredArgsConstructor
public class TokenFilter extends OncePerRequestFilter {
    private final SessionTokenRepository tokens;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            tokens.findById(header.substring(7)).filter(t -> t.getExpiresAt().isAfter(LocalDateTime.now()))
                    .ifPresent(t -> SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(t.getUser(), null,
                                    java.util.List.of(new SimpleGrantedAuthority("ROLE_" + t.getUser().getRole())))));
        }
        chain.doFilter(request, response);
    }
}
