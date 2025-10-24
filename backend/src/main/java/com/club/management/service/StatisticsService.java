package com.club.management.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.club.management.entity.*;
import com.club.management.mapper.*;
import com.club.management.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 统计服务
 */
@Service
public class StatisticsService {

    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private ActivityMapper activityMapper;

    @Autowired
    private ActivityMemberMapper activityMemberMapper;

    @Autowired
    private DeptMapper deptMapper;


    /**
     * 获取仪表板统计数据
     */
    public Result<Map<String, Object>> getDashboardStats(Object currentUser) {
        Map<String, Object> stats = new HashMap<>();
        
        // 获取用户角色和权限
        String userRole = getUserRole(currentUser);
        Long userId = getUserId(currentUser);
        
        // 成员总数
        Long totalMembers = memberMapper.selectCount(null);
        stats.put("totalMembers", totalMembers);
        
        // 近期活动（近30天）
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Long recentActivities = activityMapper.selectCount(
            new QueryWrapper<Activity>()
                .ge("start_time", thirtyDaysAgo)
        );
        stats.put("recentActivities", recentActivities);
        
        // 待审批活动
        Long pendingActivities = activityMapper.selectCount(
            new QueryWrapper<Activity>()
                .eq("status", 0)
        );
        stats.put("pendingActivities", pendingActivities);
        
        // 我参与的活动（仅对非管理员用户）
        if (userId != null && !"社长".equals(userRole) && !"副社长".equals(userRole)) {
            Long myActivities = activityMapper.selectCount(
                new QueryWrapper<Activity>()
                    .eq("create_by", userId)
            );
            stats.put("myActivities", myActivities);
        }
        
        
        return Result.success(stats);
    }

    /**
     * 获取部门统计
     */
    public Result<Map<String, Object>> getDeptStats(Object currentUser) {
        Map<String, Object> stats = new HashMap<>();
        
        // 获取所有部门及其成员数量
        List<Dept> depts = deptMapper.selectList(null);
        List<Map<String, Object>> deptStats = new java.util.ArrayList<>();
        
        for (Dept dept : depts) {
            Long memberCount = memberMapper.selectCount(
                new QueryWrapper<Member>()
                    .eq("dept_id", dept.getId())
            );
            
            Map<String, Object> deptStat = new HashMap<>();
            deptStat.put("id", dept.getId());
            deptStat.put("name", dept.getName());
            deptStat.put("intro", dept.getIntro());
            deptStat.put("memberCount", memberCount);
            deptStats.add(deptStat);
        }
        
        stats.put("depts", deptStats);
        return Result.success(stats);
    }

    /**
     * 获取活动统计
     */
    public Result<Map<String, Object>> getActivityStats(LocalDateTime startTime, LocalDateTime endTime, Object currentUser) {
        Map<String, Object> stats = new HashMap<>();
        
        QueryWrapper<Activity> queryWrapper = new QueryWrapper<>();
        if (startTime != null) {
            queryWrapper.ge("start_time", startTime);
        }
        if (endTime != null) {
            queryWrapper.le("start_time", endTime);
        }
        
        // 按状态统计
        Long totalActivities = activityMapper.selectCount(queryWrapper);
        Long approvedActivities = activityMapper.selectCount(
            queryWrapper.clone().eq("status", 1)
        );
        Long pendingActivities = activityMapper.selectCount(
            queryWrapper.clone().eq("status", 0)
        );
        Long rejectedActivities = activityMapper.selectCount(
            queryWrapper.clone().eq("status", 2)
        );
        
        stats.put("total", totalActivities);
        stats.put("approved", approvedActivities);
        stats.put("pending", pendingActivities);
        stats.put("rejected", rejectedActivities);
        
        // 按类型统计
        List<Map<String, Object>> typeStats = activityMapper.selectMaps(
            queryWrapper.clone()
                .select("type", "COUNT(*) as count")
                .groupBy("type")
        );
        stats.put("byType", typeStats);
        
        return Result.success(stats);
    }





    /**
     * 获取用户角色
     */
    private String getUserRole(Object currentUser) {
        if (currentUser instanceof Member) {
            return ((Member) currentUser).getRole();
        } else if (currentUser instanceof SysUser) {
            return ((SysUser) currentUser).getRole();
        }
        return null;
    }

    /**
     * 获取用户ID
     */
    private Long getUserId(Object currentUser) {
        if (currentUser instanceof Member) {
            return ((Member) currentUser).getId();
        } else if (currentUser instanceof SysUser) {
            return ((SysUser) currentUser).getId();
        }
        return null;
    }
}
