package com.example.controller;

import com.example.controller.dto.UserDto;
import com.example.service.KeycloakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final KeycloakService keycloakService;

    @GetMapping
    public List<UserDto> getUsers() {
        try {
            List<UserDto> users = keycloakService.getUsers();
            if (users.isEmpty())
                throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            return users;
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("{id}")
    public UserDto getUser(@PathVariable String id) {
        try {
            UserDto users = keycloakService.getUserById(id);
            if (users == null)
                throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            return users;
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }
}
