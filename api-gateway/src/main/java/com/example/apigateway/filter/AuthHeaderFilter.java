package com.example.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class AuthHeaderFilter implements GlobalFilter, Ordered {

    /*
     * Các đường dẫn không cần Authorization
     */
    private static final List<String> OPEN_PATHS = List.of(
            "/api/auth/login",
            "/api/public/courses"
    );

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain
    ) {

        ServerHttpRequest request = exchange.getRequest();

        // Lấy đường dẫn request
        String path = request.getURI().getPath();

        // Lấy HTTP method: GET, POST, PUT, DELETE...
        String method = request.getMethod() != null
                ? request.getMethod().name()
                : "";

        /*
         * Kiểm tra URL public
         *
         * /api/auth/login
         * /api/public/courses
         */
        boolean isOpen = OPEN_PATHS
                .stream()
                .anyMatch(path::startsWith);

        /*
         * Cho phép GET course không cần token
         *
         * Ví dụ:
         * GET /api/courses
         * GET /api/courses/1
         */
        boolean isPublicCourseRead =
                path.startsWith("/api/courses")
                        && method.equalsIgnoreCase("GET");

        /*
         * Nếu là API public thì cho request đi tiếp
         */
        if (isOpen || isPublicCourseRead) {
            return chain.filter(exchange);
        }

        /*
         * Các API còn lại phải có Authorization header
         *
         * Ví dụ:
         * Authorization: Bearer eyJ...
         */
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {

            exchange.getResponse()
                    .setStatusCode(HttpStatus.UNAUTHORIZED);

            return exchange.getResponse().setComplete();
        }

        /*
         * Kiểm tra Authorization có đúng dạng Bearer không
         */
        String authorization =
                request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {

            exchange.getResponse()
                    .setStatusCode(HttpStatus.UNAUTHORIZED);

            return exchange.getResponse().setComplete();
        }

        /*
         * Có Authorization rồi
         * -> cho request đi tiếp tới service
         */
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {

        /*
         * Chạy filter này sớm
         */
        return -1;
    }
}