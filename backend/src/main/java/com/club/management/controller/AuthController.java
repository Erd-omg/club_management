package com.club.management.controller;

import com.club.management.common.Result;
import com.club.management.service.AuthService;
import com.club.management.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private LogService logService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> loginData, HttpServletRequest request) {
        String stuId = loginData.get("stuId");
        String password = loginData.get("password");
        
        Result<Map<String, Object>> result = authService.login(stuId, password);
        
        // 记录登录日志
        if (result.getCode() == 200) {
            logService.logOperation(stuId, "用户登录", "POST /auth/login", "学号: " + stuId, request);
        } else {
            logService.logOperation(stuId, "登录失败", "POST /auth/login", "学号: " + stuId, request);
        }
        
        return result;
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