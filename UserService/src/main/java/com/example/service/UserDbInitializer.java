package com.example.service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class UserDbInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.password:admin}")
    private String adminPassword;

    @PostConstruct
    public void initDb() {
        User admin = userRepository.findUserByUsername("admin");
        if (admin == null) {
            User adminUser = new User("admin", "admin@admin.com",
                    passwordEncoder.encode(adminPassword));
            userRepository.save(adminUser);
        } else {
            if (!passwordEncoder.matches(adminPassword, admin.getPassword())) {
                String encodedPassword = passwordEncoder.encode(adminPassword);
                admin.setPassword(encodedPassword);
                userRepository.save(admin);
            }
        }
    }
}
