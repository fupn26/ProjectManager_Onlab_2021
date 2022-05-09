package com.example.controller.dto;

import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDto {

    private UUID id;

    private String username;

    private String email;
}
