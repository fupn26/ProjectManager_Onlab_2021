package com.example.service;

import com.example.controller.dto.UserDto;
import com.example.controller.dto.TokenResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class KeycloakService {
    private final RestTemplate restTemplate;
    @Value("${keycloak.base-url}")
    private String keyCloakBaseUrl;
    @Value("${keycloak.realm}")
    private String keyCloakRealm;
    @Value("${keycloak.admin-user}")
    private String adminUser;
    @Value("${keycloak.admin-password}")
    private String adminPassword;

    public KeycloakService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    public List<UserDto> getUsers() throws IllegalAccessException {
        TokenResponseDto token = getAdminToken();
        if (token == null)
            throw new IllegalAccessException("Can't get admin token");

        String url = keyCloakBaseUrl + "/admin/realms/" + keyCloakRealm + "/users";
        // create headers
        HttpHeaders headers = new HttpHeaders();
        // set `accept` header
        headers.setBearerAuth(token.getAccess_token());

        // build the request
        HttpEntity request = new HttpEntity(headers);

        // use `exchange` method for HTTP call
        ResponseEntity<UserDto[]> response = this.restTemplate.exchange(url, HttpMethod.GET, request, UserDto[].class);

        if(response.getStatusCode() == HttpStatus.OK) {
            return Arrays.stream(Objects.requireNonNull(response.getBody())).toList();
        } else {
            return null;
        }
    }

    public UserDto getUserById(String id) throws IllegalAccessException {
        TokenResponseDto token = getAdminToken();
        if (token == null)
            throw new IllegalAccessException("Can't get admin token");

        String url = keyCloakBaseUrl + "/admin/realms/" + keyCloakRealm + "/users/{id}";
        // create headers
        HttpHeaders headers = new HttpHeaders();
        // set `accept` header
        headers.setBearerAuth(token.getAccess_token());

        // build the request
        HttpEntity request = new HttpEntity(headers);

        // use `exchange` method for HTTP call
        ResponseEntity<UserDto> response = this.restTemplate.exchange(url, HttpMethod.GET, request, UserDto.class, id);

        if(response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            return null;
        }
    }

    private TokenResponseDto getAdminToken() {
        String url = keyCloakBaseUrl + "/realms/master/protocol/openid-connect/token";

        // create headers
        HttpHeaders headers = new HttpHeaders();
        // set `content-type` header
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // create a map for post parameters
        MultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
        map.add("client_id", "admin-cli");
        map.add("username", adminUser);
        map.add("password", adminPassword);
        map.add("grant_type", "password");

        // build the request
        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(map, headers);

        // send POST request
        ResponseEntity<TokenResponseDto> response = this.restTemplate.postForEntity(url, entity, TokenResponseDto.class);

        // check response status code
        if (response.getStatusCode() == HttpStatus.OK) {
            return Objects.requireNonNull(response.getBody());
        } else {
            return null;
        }
    }
}
