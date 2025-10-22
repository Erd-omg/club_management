package com.club.management.controller;

import com.club.management.common.Result;
import com.club.management.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        String stuId = loginData.get("stuId");
        String password = loginData.get("password");
        return authService.login(stuId, password);
    }

    /**
     * 验证token
     */
    @GetMapping("/validate")
    public Result<?> validateToken(@RequestHeader("Authorization") String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return authService.validateToken(token);
    }

    /** 开发用途：直发 token（仅用于本地联调） */
    @GetMapping("/dev/token")
    public Result<java.util.Map<String, Object>> devToken(@RequestParam String stuId) {
        return authService.issueTokenForStuId(stuId);
    }
}