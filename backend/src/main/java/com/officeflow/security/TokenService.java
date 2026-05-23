package com.officeflow.security;

import com.officeflow.model.AppUser;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final byte[] secret;

    public TokenService(@Value("${app.token-secret}") String secret) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
    }

    public String createToken(AppUser user) {
        long expiresAt = Instant.now().plusSeconds(60L * 60 * 12).getEpochSecond();
        String payload = user.getId() + ":" + expiresAt;
        String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return encodedPayload + "." + sign(encodedPayload);
    }

    public Long readUserId(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 2 || !sign(parts[0]).equals(parts[1])) {
            throw new IllegalArgumentException("Invalid token");
        }

        String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
        int separator = payload.lastIndexOf(':');
        if (separator < 1) {
            throw new IllegalArgumentException("Invalid token payload");
        }

        long expiresAt = Long.parseLong(payload.substring(separator + 1));
        if (Instant.now().getEpochSecond() > expiresAt) {
            throw new IllegalArgumentException("Expired token");
        }

        return Long.parseLong(payload.substring(0, separator));
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Could not sign token", ex);
        }
    }
}
