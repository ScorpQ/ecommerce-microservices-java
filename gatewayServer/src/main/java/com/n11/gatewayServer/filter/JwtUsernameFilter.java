package com.n11.gatewayServer.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Component
public class JwtUsernameFilter implements Filter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/product",
            "/api/user"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String path = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        boolean isPublic = PUBLIC_PATHS.stream().anyMatch(path::startsWith)
                && (path.startsWith("/api/product") ? "GET".equals(method) : true);

        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String[] parts = token.split("\\.");
                if (parts.length >= 2) {
                    byte[] decodedBytes = Base64.getUrlDecoder().decode(parts[1]);
                    String payload = new String(decodedBytes);
                    JsonNode claims = objectMapper.readTree(payload);
                    JsonNode usernameNode = claims.get("preferred_username");
                    if (usernameNode != null) {
                        MutableHttpServletRequest mutableRequest = new MutableHttpServletRequest(httpRequest);
                        mutableRequest.putHeader("X-User-Username", usernameNode.asText());
                        chain.doFilter(mutableRequest, response);
                        return;
                    }
                }
            } catch (Exception ignored) {
            }
        }

        if (!isPublic) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\": \"Unauthorized\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    static class MutableHttpServletRequest extends HttpServletRequestWrapper {
        private final Map<String, String> customHeaders = new HashMap<>();

        MutableHttpServletRequest(HttpServletRequest request) {
            super(request);
        }

        void putHeader(String name, String value) {
            customHeaders.put(name, value);
        }

        @Override
        public String getHeader(String name) {
            String value = customHeaders.get(name);
            if (value != null) return value;
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (customHeaders.containsKey(name)) {
                return Collections.enumeration(List.of(customHeaders.get(name)));
            }
            return super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            List<String> names = Collections.list(super.getHeaderNames());
            names.addAll(customHeaders.keySet());
            return Collections.enumeration(names);
        }
    }
}
