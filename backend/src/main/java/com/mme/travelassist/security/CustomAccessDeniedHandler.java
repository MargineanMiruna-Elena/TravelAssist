package com.mme.travelassist.security;

import com.mme.travelassist.model.enums.ApiErrorMessages;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json");

        String problemDetail = """
                    {
                        "type": "about:blank",
                        "title": "Access Denied",
                        "status": 403,
                        "detail": "%s",
                        "instance": "%s"
                    }
                """.formatted(ApiErrorMessages.FORBIDDEN.getCode(), request.getRequestURI());

        response.getWriter().write(problemDetail);
    }
}
