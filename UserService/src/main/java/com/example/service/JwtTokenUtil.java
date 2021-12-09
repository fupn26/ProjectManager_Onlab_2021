package com.example.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class JwtTokenUtil implements Serializable {

    @Value("${jwt.secret:3ae5ac7c4cbe8bc1f634}")
    private String secret;

    private final int tokenExpiryTime = 60 * 60 * 60 * 1000; // 1 hour

    public String generateToken(String id) {
        Map<String, Object> claims = new HashMap<>();
        return doGenerateToken(claims, id);
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setExpiration(new Date(System.currentTimeMillis() + tokenExpiryTime))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    public boolean isValidToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return !isExpired(claims);
    }

    public String getUserId(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.getSubject();
    }

    public Optional<String> getTokenFromHeader(String authHeader) {
        if (authHeader != null) {
            String[] components = authHeader.split("\s+");
            if (components.length != 2 || !components[0].equals("Bearer"))
                return Optional.empty();
            return Optional.of(components[1]);
        }
        return Optional.empty();
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
    }

    private boolean isExpired(Claims claims) {
        return new Date(System.currentTimeMillis()).after(claims.getExpiration());
    }
}
