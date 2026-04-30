package com.n11.user_service.client;

import com.n11.user_service.client.dto.KeycloakUserRequest;
import com.n11.user_service.client.dto.TokenResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "keycloak-admin-client", url = "${keycloak.admin-base-uri}")
public interface KeycloakAdminClient {

    @PostMapping(value = "/realms/master/protocol/openid-connect/token",
                 consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenResponse getAdminToken(@RequestBody MultiValueMap<String, String> params);

    @PostMapping("/admin/realms/microservice-realm/users")
    void createUser(@RequestHeader("Authorization") String bearerToken,
                    @RequestBody KeycloakUserRequest request);
}
