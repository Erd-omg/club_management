package com.club.management.controller;

import com.club.management.common.Result;
import com.club.management.entity.ActivityMember;
import com.club.management.service.ActivityMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 活动报名控制器
 */
@RestController
@RequestMapping("/activity-member")
public class ActivityMemberController {

    @Autowired
    private ActivityMemberService activityMemberService;

    @PostMapping("/signup/{activityId}")
    public Result<String> signupActivity(@PathVariable Long activityId, 
                                        @RequestAttribute("currentUser") Object currentUser) {
        return activityMemberService.signupActivity(activityId, currentUser);
    }

    @GetMapping("/list/{activityId}")
    public Result<List<ActivityMember>> getActivitySignupList(@PathVariable Long activityId,
                                                             @RequestAttribute("currentUser") Object currentUser) {
        return activityMemberService.getActivitySignupList(activityId, currentUser);
    }

    @PutMapping("/signup-status/{id}")
    public Result<String> updateSignupStatus(@PathVariable Long id,
                                            @RequestParam Integer signupStatus,
                                            @RequestAttribute("currentUser") Object currentUser) {
        return activityMemberService.updateSignupStatus(id, signupStatus, currentUser);
    }

    @PutMapping("/attendance-status/{id}")
    public Result<String> updateAttendanceStatus(@PathVariable Long id,
                                                @RequestParam Integer attendanceStatus,
                                                @RequestAttribute("currentUser") Object currentUser) {
        return activityMemberService.updateAttendanceStatus(id, attendanceStatus, currentUser);
    }

    @DeleteMapping("/{id}")
    public Result<String> deleteSignup(@PathVariable Long id,
                                      @RequestAttribute("currentUser") Object currentUser) {
        return activityMemberService.deleteSignup(id, currentUser);
    }

    @GetMapping("/check/{activityId}")
    public Result<Boolean> checkSignupStatus(@PathVariable Long activityId,
                                            @RequestAttribute("currentUser") Object currentUser) {
        return activityMemberService.checkSignupStatus(activityId, currentUser);
    }
}
