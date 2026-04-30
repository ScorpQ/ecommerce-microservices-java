package com.n11.user_service.client.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class KeycloakUserRequest {

    private String username;
    private String email;
    private boolean enabled;
    private List<CredentialRepresentation> credentials;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CredentialRepresentation {
        private String type;
        private String value;
        private boolean temporary;
    }
}
