package com.club.management.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.club.management.entity.Activity;
import com.club.management.entity.ActivityMember;
import com.club.management.mapper.ActivityMapper;
import com.club.management.mapper.ActivityApproverMapper;
import com.club.management.mapper.ActivityDeptMapper;
import com.club.management.mapper.SysMessageMapper;
import com.club.management.entity.ActivityApprover;
import com.club.management.entity.ActivityDept;
import com.club.management.entity.SysMessage;
import com.club.management.mapper.ActivityMemberMapper;
import com.club.management.common.Result;
import com.club.management.common.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 活动服务
 */
@Service
public class ActivityService extends ServiceImpl<ActivityMapper, Activity> {

    @Autowired
    private ActivityMemberMapper activityMemberMapper;

    @Autowired
    private ActivityApproverMapper activityApproverMapper;

    @Autowired
    private ActivityDeptMapper activityDeptMapper;

    @Autowired
    private SysMessageMapper sysMessageMapper;

    /**
     * 分页查询活动
     */
    public Result<Page<Activity>> getActivityPage(int page, int size, String name,
                                                String type, Long deptId, Integer status, Long createBy,
                                                LocalDateTime startTime, LocalDateTime endTime,
                                                String sortField, String sortOrder) {
        Page<Activity> pageParam = new Page<>(page, size);
        Page<Activity> result = (Page<Activity>) baseMapper.selectActivityPage(pageParam, name, type, deptId, status, createBy, startTime, endTime, sortField, sortOrder);
        
        // 为每个活动添加审批人信息
        for (Activity activity : result.getRecords()) {
            List<Map<String, Object>> approvers = baseMapper.selectActivityApprovers(activity.getId());
            activity.setApprovers(approvers);
        }
        
        return Result.success(result);
    }

    /**
     * 添加活动
     */
    public Result<String> addActivity(Activity activity, Object currentUser) {
        try {
            // 权限检查：根据SDS.md，只有社长、副社长、部长可以创建活动
            String userRole = getUserRole(currentUser);
            if (!"社长".equals(userRole) && !"副社长".equals(userRole) && !"部长".equals(userRole)) {
                return Result.businessError(ErrorCode.FORBIDDEN, "权限不足，只有社长、副社长、部长可以创建活动");
            }
            
            // 设置创建人ID
            Long userId = getUserId(currentUser);
            if (userId == null) {
                return Result.businessError(ErrorCode.UNAUTHORIZED, "用户信息无效");
            }
            
            // 设置状态为待审批和创建人
            activity.setStatus(0);
            activity.setCreateBy(userId);
            
            // 设置默认的开始和结束时间（如果未提供）
            if (activity.getStartTime() == null) {
                activity.setStartTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0));
            }
            if (activity.getEndTime() == null) {
                activity.setEndTime(activity.getStartTime().plusHours(2));
            }
            
            // 添加调试信息
            System.out.println("准备保存活动: " + activity);
            
            save(activity);
            return Result.success("添加活动成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "添加活动失败: " + e.getMessage());
        }
    }

    /**
     * 设置审批人与责任部门（创建或更新时调用）
     */
    public Result<String> setApproversAndDepts(Long activityId, List<Long> approverUserIds, List<Long> deptIds) {
        // 先清空原关系
        activityApproverMapper.delete(new QueryWrapper<ActivityApprover>().eq("activity_id", activityId));
        activityDeptMapper.delete(new QueryWrapper<ActivityDept>().eq("activity_id", activityId));

        if (approverUserIds != null) {
            for (Long uid : approverUserIds) {
                ActivityApprover ap = new ActivityApprover();
                ap.setActivityId(activityId);
                ap.setUserId(uid);
                ap.setStatus(0);
                activityApproverMapper.insert(ap);
            }
        }
        if (deptIds != null) {
            for (Long did : deptIds) {
                ActivityDept ad = new ActivityDept();
                ad.setActivityId(activityId);
                ad.setDeptId(did);
                activityDeptMapper.insert(ad);
            }
        }
        return Result.success("添加活动成功");
    }

    /**
     * 更新活动
     */
    public Result<String> updateActivity(Activity activity, Object currentUser) {
        // 权限检查：根据SDS.md，只有社长、副社长、部长可以编辑活动
        String userRole = getUserRole(currentUser);
        if (!"社长".equals(userRole) && !"副社长".equals(userRole) && !"部长".equals(userRole)) {
            return Result.businessError(ErrorCode.FORBIDDEN, "权限不足，只有社长、副社长、部长可以编辑活动");
        }
        
        // 检查活动是否已审批通过
        Activity existingActivity = getById(activity.getId());
        if (existingActivity != null && existingActivity.getStatus() == 1) {
            return Result.businessError(ErrorCode.ACTIVITY_APPROVED, "活动已审批通过，不可修改");
        }

        // 设置更新时间
        activity.setUpdateTime(LocalDateTime.now());
        updateById(activity);
        return Result.success("更新活动成功");
    }

    /**
     * 删除活动
     */
    public Result<String> deleteActivity(Long id, Object currentUser) {
        // 权限检查：根据SDS.md，只有社长、副社长可以删除活动
        String userRole = getUserRole(currentUser);
        if (!"社长".equals(userRole) && !"副社长".equals(userRole)) {
            return Result.businessError(ErrorCode.FORBIDDEN, "权限不足，只有社长、副社长可以删除活动");
        }
        
        // 删除活动参与记录
        activityMemberMapper.delete(new QueryWrapper<ActivityMember>().eq("activity_id", id));
        // 删除活动
        removeById(id);
        return Result.success("删除活动成功");
    }

    /**
     * 审批活动
     */
    public Result<String> approveActivity(Long id, Integer status, String rejectReason) {
        Activity activity = getById(id);
        if (activity == null) {
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "活动不存在");
        }

        // 兼容旧接口：直接设置整体状态（将逐步废弃，推荐使用 approveByCurrentUser）
        activity.setStatus(status);
        if (status == 2) { // 驳回
            activity.setRejectReason(rejectReason);
        }
        updateById(activity);
        return Result.success("审批完成");
    }

    /**
     * 当前审批人进行审批
     */
    public Result<String> approveByUser(Long activityId, Long approverUserId, boolean pass, String rejectReason) {
        Activity activity = getById(activityId);
        if (activity == null) {
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "活动不存在");
        }
        ActivityApprover ap = activityApproverMapper.selectOne(
                new QueryWrapper<ActivityApprover>()
                        .eq("activity_id", activityId)
                        .eq("user_id", approverUserId));
        if (ap == null) {
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "无审批权限");
        }
        if (ap.getStatus() != null && ap.getStatus() != 0) {
            return Result.success("已处理");
        }
        ap.setStatus(pass ? 1 : 2);
        ap.setApprovalTime(LocalDateTime.now());
        activityApproverMapper.updateById(ap);

        if (!pass) {
            activity.setStatus(2);
            activity.setRejectReason(rejectReason);
            updateById(activity);
            // 发送驳回通知给创建者
            if (activity.getCreateBy() != null) {
                SysMessage msg = new SysMessage();
                msg.setRecipientId(activity.getCreateBy());
                msg.setSenderId(approverUserId);
                msg.setTitle("活动驳回通知");
                msg.setContent((activity.getName() != null ? activity.getName() : "活动") + " 已被驳回，理由：" + (rejectReason == null ? "无" : rejectReason));
                msg.setStatus(0);
                sysMessageMapper.insert(msg);
            }
            return Result.success("已驳回");
        }

        // 检查是否全部通过
        Long waiting = activityApproverMapper.selectCount(new QueryWrapper<ActivityApprover>()
                .eq("activity_id", activityId).eq("status", 0));
        if (waiting != null && waiting == 0L) {
            activity.setStatus(1);
            updateById(activity);
        }
        return Result.success("已通过");
    }

    /**
     * 获取活动详情
     */
    public Result<Activity> getActivityById(Long id) {
        Activity activity = getById(id);
        if (activity == null) {
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "活动不存在");
        }
        return Result.success(activity);
    }

    /**
     * 获取活动完整详情（包含审批人、负责部门、参与成员等信息）
     */
    public Result<Map<String, Object>> getActivityFullDetail(Long id) {
        Activity activity = getById(id);
        if (activity == null) {
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "活动不存在");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("activity", activity);

        // 获取审批人信息
        List<Map<String, Object>> approvers = baseMapper.selectActivityApprovers(id);
        result.put("approvers", approvers);

        // 获取负责部门信息
        List<Map<String, Object>> depts = baseMapper.selectActivityDepts(id);
        result.put("depts", depts);

        // 获取参与成员信息
        List<Map<String, Object>> members = baseMapper.selectActivityMembersWithDetails(id);
        result.put("members", members);

        return Result.success(result);
    }

    /**
     * 获取活动的参与成员
     */
    public Result<List<Map<String, Object>>> getActivityMembers(Long activityId) {
        List<Map<String, Object>> members = baseMapper.selectActivityMembers(activityId);
        return Result.success(members);
    }

    /**
     * 更新活动参与成员
     */
    public Result<String> updateActivityMembers(Long activityId, List<Long> memberIds) {
        try {
            // 先删除该活动的所有参与记录
            activityMemberMapper.delete(new QueryWrapper<ActivityMember>().eq("activity_id", activityId));
            
            // 然后添加新的参与记录
            for (Long memberId : memberIds) {
                ActivityMember activityMember = new ActivityMember();
                activityMember.setActivityId(activityId);
                activityMember.setMemberId(memberId);
                activityMember.setSignupTime(LocalDateTime.now());
                activityMember.setSignupStatus(1); // 已报名
                activityMember.setAttendanceStatus(0); // 未签到
                activityMemberMapper.insert(activityMember);
            }
            
            // 更新活动的updateTime
            Activity activity = getById(activityId);
            if (activity != null) {
                activity.setUpdateTime(LocalDateTime.now());
                updateById(activity);
            }
            
            return Result.success("更新参与成员成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "更新参与成员失败: " + e.getMessage());
        }
    }

    /**
     * 获取活动的审批人信息
     */
    public Result<List<Map<String, Object>>> getActivityApprovers(Long activityId) {
        List<Map<String, Object>> approvers = baseMapper.selectActivityApprovers(activityId);
        return Result.success(approvers);
    }

    /**
     * 获取活动的负责部门信息
     */
    public Result<List<Map<String, Object>>> getActivityDepts(Long activityId) {
        List<Map<String, Object>> depts = baseMapper.selectActivityDepts(activityId);
        return Result.success(depts);
    }
    
    /**
     * 获取用户角色
     */
    private String getUserRole(Object currentUser) {
        if (currentUser instanceof com.club.management.entity.Member) {
            com.club.management.entity.Member member = (com.club.management.entity.Member) currentUser;
            return member.getRole();
        } else if (currentUser instanceof com.club.management.entity.SysUser) {
            com.club.management.entity.SysUser sysUser = (com.club.management.entity.SysUser) currentUser;
            return sysUser.getRole();
        }
        return null;
    }
    
    private Long getUserId(Object currentUser) {
        if (currentUser instanceof com.club.management.entity.Member) {
            com.club.management.entity.Member member = (com.club.management.entity.Member) currentUser;
            return member.getId();
        } else if (currentUser instanceof com.club.management.entity.SysUser) {
            com.club.management.entity.SysUser sysUser = (com.club.management.entity.SysUser) currentUser;
            return sysUser.getId();
        }
        return null;
    }
}
