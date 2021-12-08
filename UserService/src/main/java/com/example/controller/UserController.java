package com.example.controller;

import com.example.controller.dto.UserDto;
import com.example.controller.dto.UserRegisterDto;
import com.example.entity.User;
import com.example.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody UserRegisterDto userRegisterDto) {
        if (userRepository.findUserByUsernameOrEmail(userRegisterDto.getUsername(), userRegisterDto.getEmail()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT);

        User user = userRepository.save(mapToUser(userRegisterDto));
        return new ResponseEntity<>(mapToUserDto(user), HttpStatus.CREATED);
    }

    @GetMapping
    public List<UserDto> getUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    private User mapToUser(UserRegisterDto userRegisterDto) {
        return new User(userRegisterDto.getUsername(),
                userRegisterDto.getEmail(),
                passwordEncoder.encode(userRegisterDto.getPassword()));
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}
