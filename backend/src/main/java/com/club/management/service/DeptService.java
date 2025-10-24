package com.club.management.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.club.management.entity.Dept;
import com.club.management.entity.Member;
import com.club.management.entity.SysUser;
import com.club.management.mapper.DeptMapper;
import com.club.management.mapper.MemberMapper;
import com.club.management.mapper.ActivityMapper;
import com.club.management.common.Result;
import com.club.management.common.ErrorCode;
import com.club.management.dto.DeptCard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 部门服务
 */
@Service
public class DeptService extends ServiceImpl<DeptMapper, Dept> {

    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private ActivityMapper activityMapper;

    /**
     * 获取所有部门
     */
    public Result<List<Dept>> getAllDepts() {
        List<Dept> depts = list(new QueryWrapper<Dept>().orderByAsc("id"));
        return Result.success(depts);
    }

    /** 部门卡片列表（含简介、成员数聚合） */
    public Result<List<DeptCard>> getDeptCards() {
        List<DeptCard> cards = baseMapper.selectDeptCards();
        return Result.success(cards);
    }

    /** 部门详情：基本信息、成员列表数量与最近活动概览 */
    public Result<Map<String, Object>> getDeptDetail(Long id) {
        Dept dept = getById(id);
        if (dept == null) {
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "部门不存在");
        }
        
        // 获取部门成员数量
        long memberCount = memberMapper.selectCount(new QueryWrapper<Member>().eq("dept_id", id));
        
        // 创建包含成员数量的部门信息
        Map<String, Object> deptWithCount = new HashMap<>();
        deptWithCount.put("id", dept.getId());
        deptWithCount.put("name", dept.getName());
        deptWithCount.put("intro", dept.getIntro());
        deptWithCount.put("createTime", dept.getCreateTime());
        deptWithCount.put("memberCount", memberCount);
        
        Map<String, Object> data = new HashMap<>();
        data.put("dept", deptWithCount);
        
        // 获取部门成员
        List<Member> members = memberMapper.selectList(new QueryWrapper<Member>().eq("dept_id", id));
        data.put("members", members);
        
        // 获取部门相关活动（通过活动负责部门关联表）
        List<Map<String, Object>> activities = baseMapper.selectDeptActivities(id);
        data.put("activities", activities);
        
        return Result.success(data);
    }

    /**
     * 添加部门
     */
    public Result<String> addDept(Dept dept) {
        // 检查部门名称是否已存在
        Dept existingDept = getOne(new QueryWrapper<Dept>().eq("name", dept.getName()));
        if (existingDept != null) {
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "部门名称已存在");
        }

        save(dept);
        return Result.success("添加部门成功");
    }

    /**
     * 更新部门
     */
    public Result<String> updateDept(Dept dept) {
        // 检查部门名称是否已存在（排除自己）
        Dept existingDept = getOne(new QueryWrapper<Dept>()
                .eq("name", dept.getName())
                .ne("id", dept.getId()));
        if (existingDept != null) {
            return Result.businessError(ErrorCode.SYSTEM_ERROR, "部门名称已存在");
        }

        updateById(dept);
        return Result.success("更新部门成功");
    }

    /**
     * 删除部门
     */
    public Result<String> deleteDept(Long id, Object currentUser) {
        // 权限验证：只有社长和副社长可以删除部门
        if (currentUser instanceof Member) {
            Member member = (Member) currentUser;
            String role = member.getRole();
            if (!"社长".equals(role) && !"副社长".equals(role)) {
                return Result.businessError(ErrorCode.FORBIDDEN, "只有社长和副社长可以删除部门");
            }
        } else if (currentUser instanceof SysUser) {
            SysUser sysUser = (SysUser) currentUser;
            String role = sysUser.getRole();
            if (!"社长".equals(role) && !"副社长".equals(role)) {
                return Result.businessError(ErrorCode.FORBIDDEN, "只有社长和副社长可以删除部门");
            }
        } else {
            return Result.businessError(ErrorCode.UNAUTHORIZED, "用户信息无效");
        }

        // 检查部门下是否还有成员
        long memberCount = memberMapper.selectCount(
                new QueryWrapper<Member>().eq("dept_id", id));
        if (memberCount > 0) {
            return Result.businessError(ErrorCode.DEPT_HAS_MEMBERS, "部门下仍有成员，无法删除");
        }

        removeById(id);
        return Result.success("删除部门成功");
    }
}

