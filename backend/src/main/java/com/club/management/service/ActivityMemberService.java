package com.club.management.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.club.management.common.ErrorCode;
import com.club.management.common.Result;
import com.club.management.entity.Activity;
import com.club.management.entity.ActivityMember;
import com.club.management.entity.Member;
import com.club.management.entity.SysUser;
import com.club.management.mapper.ActivityMemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 活动报名服务
 */
@Service
public class ActivityMemberService extends ServiceImpl<ActivityMemberMapper, ActivityMember> {

    @Autowired
    private ActivityMemberMapper activityMemberMapper;

    @Autowired
    private ActivityService activityService;

    /**
     * 报名活动
     */
    public Result<String> signupActivity(Long activityId, Object currentUser) {
        try {
            // 权限检查：指导老师不能报名活动
            String userRole = getUserRole(currentUser);
            if ("指导老师".equals(userRole)) {
                return Result.businessError(ErrorCode.FORBIDDEN, "指导老师不能报名活动");
            }

            // 获取当前用户ID
            Long memberId = getUserId(currentUser);
            if (memberId == null) {
                return Result.businessError(ErrorCode.UNAUTHORIZED, "用户信息无效");
            }

            // 检查活动是否存在且已审批通过
            Activity activity = activityService.getById(activityId);
            if (activity == null) {
                return Result.businessError(ErrorCode.NOT_FOUND, "活动不存在");
            }
            if (activity.getStatus() != 1) {
                return Result.businessError(ErrorCode.BAD_REQUEST, "活动未审批通过，无法报名");
            }

            // 检查是否已经报名
            QueryWrapper<ActivityMember> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("activity_id", activityId)
                       .eq("member_id", memberId);
            ActivityMember existingRecord = getOne(queryWrapper);
            if (existingRecord != null) {
                return Result.businessError(ErrorCode.BAD_REQUEST, "您已经报名过此活动");
            }

            // 创建报名记录
            ActivityMember activityMember = new ActivityMember();
            activityMember.setActivityId(activityId);
            activityMember.setMemberId(memberId);
            activityMember.setSignupTime(LocalDateTime.now());
            activityMember.setSignupStatus(0); // 0-已报名

            save(activityMember);
            return Result.success("报名成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "报名失败: " + e.getMessage());
        }
    }

    /**
     * 获取活动的报名列表
     */
    public Result<List<ActivityMember>> getActivitySignupList(Long activityId, Object currentUser) {
        try {
            // 权限检查：只有社长、副社长、部长可以查看报名列表
            String userRole = getUserRole(currentUser);
            if (!"社长".equals(userRole) && !"副社长".equals(userRole) && !"部长".equals(userRole)) {
                return Result.businessError(ErrorCode.FORBIDDEN, "权限不足，只有社长、副社长、部长可以查看报名列表");
            }

            QueryWrapper<ActivityMember> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("activity_id", activityId)
                       .orderByDesc("signup_time");
            List<ActivityMember> list = list(queryWrapper);
            return Result.success(list);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "获取报名列表失败: " + e.getMessage());
        }
    }

    /**
     * 更新报名状态
     */
    public Result<String> updateSignupStatus(Long id, Integer signupStatus, Object currentUser) {
        try {
            // 权限检查：只有社长、副社长、部长可以更新报名状态
            String userRole = getUserRole(currentUser);
            if (!"社长".equals(userRole) && !"副社长".equals(userRole) && !"部长".equals(userRole)) {
                return Result.businessError(ErrorCode.FORBIDDEN, "权限不足");
            }

            ActivityMember activityMember = getById(id);
            if (activityMember == null) {
                return Result.businessError(ErrorCode.NOT_FOUND, "报名记录不存在");
            }

            activityMember.setSignupStatus(signupStatus);
            updateById(activityMember);
            return Result.success("更新成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "更新失败: " + e.getMessage());
        }
    }


    /**
     * 删除报名记录
     */
    public Result<String> deleteSignup(Long id, Object currentUser) {
        try {
            // 权限检查：只有社长、副社长、部长可以删除报名记录
            String userRole = getUserRole(currentUser);
            if (!"社长".equals(userRole) && !"副社长".equals(userRole) && !"部长".equals(userRole)) {
                return Result.businessError(ErrorCode.FORBIDDEN, "权限不足");
            }

            ActivityMember activityMember = getById(id);
            if (activityMember == null) {
                return Result.businessError(ErrorCode.NOT_FOUND, "报名记录不存在");
            }

            removeById(id);
            return Result.success("删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "删除失败: " + e.getMessage());
        }
    }

    /**
     * 检查用户是否已报名某活动
     */
    public Result<Boolean> checkSignupStatus(Long activityId, Object currentUser) {
        try {
            Long memberId = getUserId(currentUser);
            if (memberId == null) {
                return Result.businessError(ErrorCode.UNAUTHORIZED, "用户信息无效");
            }

            QueryWrapper<ActivityMember> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("activity_id", activityId)
                       .eq("member_id", memberId);
            ActivityMember existingRecord = getOne(queryWrapper);
            
            return Result.success(existingRecord != null);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "检查失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户角色
     */
    private String getUserRole(Object currentUser) {
        if (currentUser instanceof Member) {
            Member member = (Member) currentUser;
            return member.getRole();
        } else if (currentUser instanceof SysUser) {
            SysUser sysUser = (SysUser) currentUser;
            return sysUser.getRole();
        }
        return null;
    }

    /**
     * 获取用户ID
     */
    private Long getUserId(Object currentUser) {
        if (currentUser instanceof Member) {
            Member member = (Member) currentUser;
            return member.getId();
        } else if (currentUser instanceof SysUser) {
            SysUser sysUser = (SysUser) currentUser;
            return sysUser.getId();
        }
        return null;
    }
}
