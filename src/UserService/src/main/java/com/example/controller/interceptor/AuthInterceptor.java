package com.example.controller.interceptor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * Responsible for extracting bearer token, if it is passed as query param, and adding it to the request as attribute.
 */
@Component
@Slf4j
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String forwardedUri = request.getHeader("X-Forwarded-Uri");
        if (forwardedUri != null && request.getHeader("Authorization") == null) {
            log.info("Query params: {}", UriComponentsBuilder.fromUriString(forwardedUri)
                    .build()
                    .getQueryParams());
            log.info("Authorization header: {}", request.getHeader("Authorization"));
            List<String> accessTokens = UriComponentsBuilder.fromUriString(forwardedUri)
                    .build()
                    .getQueryParams()
                    .get("access_token");
            if (!accessTokens.isEmpty()) {
                log.info("Access tokens: {}", accessTokens);
                request.setAttribute("access_token", accessTokens.get(0));
            }
        }
        return true;
    }
}
