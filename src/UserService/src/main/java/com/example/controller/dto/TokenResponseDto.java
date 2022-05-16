package com.example.controller.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class TokenResponseDto implements Serializable {
    private String access_token;
}
