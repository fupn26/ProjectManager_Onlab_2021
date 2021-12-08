package com.example.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.UUID;

@Builder
@AllArgsConstructor
public class UserDto {

    private UUID id;

    private String username;

    private String email;
}
