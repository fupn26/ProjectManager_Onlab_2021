package com.example.service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Slf4j
@Service
@Scope("singleton")
@RequiredArgsConstructor
public class UserDbInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private boolean isDbInitialized = false;

    @Value("${admin.password:admin}")
    private String adminPassword;

    // Tries to init database right after the construction, in case of failure it can be retried later.
    @PostConstruct
    public void initDb() {
        if (isDbInitialized)
            return;
        try {
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
            isDbInitialized = true;
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }
}
