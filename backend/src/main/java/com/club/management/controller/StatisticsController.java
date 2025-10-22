package com.club.management.controller;

import com.club.management.common.Result;
import com.club.management.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 统计控制器
 */
@RestController
@RequestMapping("/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    /**
     * 获取仪表板统计数据
     */
    @GetMapping("/dashboard")
    public Result<Map<String, Object>> getDashboardStats(@RequestAttribute("currentUser") Object currentUser) {
        return statisticsService.getDashboardStats(currentUser);
    }

    /**
     * 获取部门统计
     */
    @GetMapping("/dept")
    public Result<Map<String, Object>> getDeptStats(@RequestAttribute("currentUser") Object currentUser) {
        return statisticsService.getDeptStats(currentUser);
    }

    /**
     * 获取活动统计
     */
    @GetMapping("/activity")
    public Result<Map<String, Object>> getActivityStats(
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime,
            @RequestAttribute("currentUser") Object currentUser) {
        return statisticsService.getActivityStats(startTime, endTime, currentUser);
    }

    /**
     * 获取出勤率统计
     */
    @GetMapping("/attendance")
    public Result<Map<String, Object>> getAttendanceStats(
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime,
            @RequestAttribute("currentUser") Object currentUser) {
        return statisticsService.getAttendanceStats(memberId, deptId, startTime, endTime, currentUser);
    }
}
