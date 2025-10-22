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
        
        // 我的出勤率（仅对非管理员用户）
        if (userId != null && !"社长".equals(userRole) && !"副社长".equals(userRole)) {
            Map<String, Object> attendanceStats = calculateMemberAttendance(userId);
            stats.put("myAttendance", attendanceStats);
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
     * 获取出勤率统计
     */
    public Result<Map<String, Object>> getAttendanceStats(Long memberId, Long deptId, 
                                                         LocalDateTime startTime, LocalDateTime endTime, 
                                                         Object currentUser) {
        Map<String, Object> stats = new HashMap<>();
        
        // 权限检查
        String userRole = getUserRole(currentUser);
        Long userId = getUserId(currentUser);
        
        if (memberId != null) {
            // 获取特定成员的出勤率
            if (!"社长".equals(userRole) && !"副社长".equals(userRole) && !memberId.equals(userId)) {
                return Result.businessError(com.club.management.common.ErrorCode.FORBIDDEN, "权限不足");
            }
            stats = calculateMemberAttendance(memberId);
        } else if (deptId != null) {
            // 获取部门出勤率
            if (!"社长".equals(userRole) && !"副社长".equals(userRole)) {
                return Result.businessError(com.club.management.common.ErrorCode.FORBIDDEN, "权限不足");
            }
            stats = calculateDeptAttendance(deptId, startTime, endTime);
        } else {
            // 获取整体出勤率
            if (!"社长".equals(userRole) && !"副社长".equals(userRole)) {
                return Result.businessError(com.club.management.common.ErrorCode.FORBIDDEN, "权限不足");
            }
            stats = calculateOverallAttendance(startTime, endTime);
        }
        
        return Result.success(stats);
    }

    /**
     * 计算成员出勤率
     */
    private Map<String, Object> calculateMemberAttendance(Long memberId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 获取成员参与的活动总数
        Long totalActivities = activityMemberMapper.selectCount(
            new QueryWrapper<ActivityMember>()
                .eq("member_id", memberId)
        );
        
        // 获取成员实际参与的活动数（这里简化处理，假设所有记录的活动都是参与的）
        Long attendedActivities = totalActivities;
        
        // 计算出勤率
        double attendanceRate = totalActivities > 0 ? (double) attendedActivities / totalActivities * 100 : 0;
        
        stats.put("totalActivities", totalActivities);
        stats.put("attendedActivities", attendedActivities);
        stats.put("attendanceRate", Math.round(attendanceRate * 100.0) / 100.0);
        
        return stats;
    }

    /**
     * 计算部门出勤率
     */
    private Map<String, Object> calculateDeptAttendance(Long deptId, LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> stats = new HashMap<>();
        
        // 获取部门成员
        List<Member> members = memberMapper.selectList(
            new QueryWrapper<Member>()
                .eq("dept_id", deptId)
        );
        
        double totalAttendanceRate = 0;
        int memberCount = 0;
        
        for (Member member : members) {
            Map<String, Object> memberStats = calculateMemberAttendance(member.getId());
            totalAttendanceRate += (Double) memberStats.get("attendanceRate");
            memberCount++;
        }
        
        double avgAttendanceRate = memberCount > 0 ? totalAttendanceRate / memberCount : 0;
        
        stats.put("memberCount", memberCount);
        stats.put("avgAttendanceRate", Math.round(avgAttendanceRate * 100.0) / 100.0);
        
        return stats;
    }

    /**
     * 计算整体出勤率
     */
    private Map<String, Object> calculateOverallAttendance(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> stats = new HashMap<>();
        
        // 获取所有成员
        List<Member> members = memberMapper.selectList(null);
        
        double totalAttendanceRate = 0;
        int memberCount = 0;
        
        for (Member member : members) {
            Map<String, Object> memberStats = calculateMemberAttendance(member.getId());
            totalAttendanceRate += (Double) memberStats.get("attendanceRate");
            memberCount++;
        }
        
        double avgAttendanceRate = memberCount > 0 ? totalAttendanceRate / memberCount : 0;
        
        stats.put("totalMembers", memberCount);
        stats.put("avgAttendanceRate", Math.round(avgAttendanceRate * 100.0) / 100.0);
        
        return stats;
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
