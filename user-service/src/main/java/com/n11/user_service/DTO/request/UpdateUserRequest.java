package com.n11.user_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {

    @Size(min = 6, max = 40)
    private String password;

    @Size(max = 50)
    @Email
    private String email;
}
