package com.example.controller;

import com.example.controller.dto.JwtDto;
import com.example.controller.dto.UserDto;
import com.example.controller.dto.UserRegisterDto;
import com.example.controller.dto.CredentialDto;
import com.example.entity.User;
import com.example.repository.UserRepository;
import com.example.service.JwtTokenUtil;
import com.example.service.UserDbInitializer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDbInitializer dbInitializer;

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody UserRegisterDto userRegisterDto) {
        if (userRepository.findUserByUsernameOrEmail(userRegisterDto.getUsername(), userRegisterDto.getEmail()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT);

        var user = userRepository.save(mapToUser(userRegisterDto));
        return new ResponseEntity<>(mapToUserDto(user), HttpStatus.CREATED);
    }

    @GetMapping("/auth")
    public void authUser(@RequestHeader(value = "Authorization") String credentials) {
        dbInitializer.initDb(); // init db if it is not initialized already
        Optional<String> token = jwtTokenUtil.getTokenFromHeader(credentials);
        if (token.isEmpty() || !jwtTokenUtil.isValidToken(token.get())
                || !userRepository.existsById(UUID.fromString(jwtTokenUtil.getUserId(token.get()))))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/signin")
    public ResponseEntity<JwtDto> signIn(@RequestBody CredentialDto credentialDto) {
        dbInitializer.initDb(); // init db if it is not initialized already
        var user = userRepository.findUserByUsername(credentialDto.getUsername());
        if (user != null && credentialDto.getPassword() != null
                && passwordEncoder.matches(credentialDto.getPassword(), user.getPassword())) {
            var jwtDto = new JwtDto();
            jwtDto.setToken(jwtTokenUtil.generateToken(user.getId().toString()));
            return new ResponseEntity<>(jwtDto, HttpStatus.ACCEPTED);
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    @GetMapping
    public List<UserDto> getUsers() {
        dbInitializer.initDb(); // init db if it is not initialized already
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @GetMapping("{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable String id) {
        dbInitializer.initDb(); // init db if it is not initialized already
        var user = userRepository.findById(UUID.fromString(id));
        if (user.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(mapToUserDto(user.get()), HttpStatus.OK);
    }

    private User mapToUser(UserRegisterDto userRegisterDto) {
        return new User(userRegisterDto.getUsername(),
                userRegisterDto.getEmail(),
                passwordEncoder.encode(userRegisterDto.getPassword()));
    }

    private UserDto mapToUserDto(User user) {
        return new UserDto(user.getId(),
                user.getUsername(), user.getEmail());
    }
}
