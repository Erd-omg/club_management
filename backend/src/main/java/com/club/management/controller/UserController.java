package com.club.management.controller;

import com.club.management.common.Result;
import com.club.management.mapper.DeptMapper;
import com.club.management.mapper.MemberMapper;
import com.club.management.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private SysUserMapper sysUserMapper;


    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private DeptMapper deptMapper;

    /** 按姓名或学号模糊检索 */
    @GetMapping("/search")
    public Result<List<Map<String, Object>>> search(@RequestParam String q,
                                       @RequestParam(required = false) String role) {
        try {
            // 只搜索Member表，包含部门信息
            List<Map<String, Object>> memberList = memberMapper.searchMembersWithDept(q, role);
            return Result.success(memberList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.businessError(500, "搜索失败: " + e.getMessage());
        }
    }






    /** 获取当前用户信息 */
    @GetMapping("/profile")
    public Result<Object> getProfile(@RequestAttribute("currentUser") Object currentUser) {
        if (currentUser instanceof com.club.management.entity.Member) {
            // 如果是Member类型，需要获取部门名称
            com.club.management.entity.Member member = (com.club.management.entity.Member) currentUser;
            if (member.getDeptId() != null) {
                com.club.management.entity.Dept dept = deptMapper.selectById(member.getDeptId());
                if (dept != null) {
                    member.setDeptName(dept.getName());
                }
            }
            return Result.success(member);
        } else if (currentUser instanceof com.club.management.entity.SysUser) {
            // 如果是SysUser类型，从member表中获取详细信息
            com.club.management.entity.SysUser sysUser = (com.club.management.entity.SysUser) currentUser;
            com.club.management.entity.Member member = memberMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.club.management.entity.Member>()
                    .eq("stu_id", sysUser.getStuId())
            );
            if (member != null && member.getDeptId() != null) {
                com.club.management.entity.Dept dept = deptMapper.selectById(member.getDeptId());
                if (dept != null) {
                    member.setDeptName(dept.getName());
                }
            }
            return Result.success(member);
        }
        return Result.businessError(404, "用户信息不存在");
    }

    /** 更新个人信息 */
    @PutMapping("/profile")
    public Result<String> updateProfile(@RequestBody com.club.management.entity.Member member,
                                        @RequestAttribute("currentUser") Object currentUser) {
        String stuId = getStuId(currentUser);
        if (stuId == null) {
            return Result.businessError(404, "用户不存在");
        }
        
        // 验证权限：只能更新自己的信息
        com.club.management.entity.Member existingMember = memberMapper.selectOne(
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.club.management.entity.Member>()
                .eq("stu_id", stuId)
        );
        
        if (existingMember == null) {
            return Result.businessError(404, "用户不存在");
        }
        
        // 只允许更新特定字段
        existingMember.setName(member.getName());
        existingMember.setEmail(member.getEmail());
        existingMember.setPhone(member.getPhone());
        existingMember.setGender(member.getGender());
        existingMember.setCollege(member.getCollege());
        existingMember.setMajor(member.getMajor());
        existingMember.setGrade(member.getGrade());
        
        memberMapper.updateById(existingMember);
        return Result.success("更新成功");
    }

    /** 修改密码 */
    @PutMapping("/password")
    public Result<String> changePassword(@RequestBody Map<String, String> passwordData,
                                         @RequestAttribute("currentUser") Object currentUser) {
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");
        
        if (oldPassword == null || newPassword == null) {
            return Result.businessError(400, "参数不完整");
        }
        
        // 从数据库重新查询用户信息，确保获取到最新的密码
        String currentPassword = null;
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.businessError(400, "用户信息错误");
        }
        
        if (currentUser instanceof com.club.management.entity.Member) {
            com.club.management.entity.Member member = memberMapper.selectById(userId);
            if (member == null) {
                return Result.businessError(400, "用户不存在");
            }
            currentPassword = member.getPassword();
        } else if (currentUser instanceof com.club.management.entity.SysUser) {
            com.club.management.entity.SysUser sysUser = sysUserMapper.selectById(userId);
            if (sysUser == null) {
                return Result.businessError(400, "用户不存在");
            }
            currentPassword = sysUser.getPassword();
        }
        
        if (currentPassword == null) {
            return Result.businessError(400, "用户信息错误");
        }
        
        // 验证旧密码
        if (!org.springframework.security.crypto.bcrypt.BCrypt.checkpw(oldPassword, currentPassword)) {
            System.out.println("密码验证失败: 用户ID=" + userId + ", 输入的旧密码不正确");
            return Result.businessError(400, "原密码错误");
        }
        
        System.out.println("密码验证成功: 用户ID=" + userId + ", 开始更新密码");
        
        // 更新密码
        String hashedPassword = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(newPassword, 
            org.springframework.security.crypto.bcrypt.BCrypt.gensalt(10));
        
        if (currentUser instanceof com.club.management.entity.Member) {
            com.club.management.entity.Member member = memberMapper.selectById(userId);
            if (member == null) {
                System.out.println("密码更新失败: 成员不存在, ID=" + userId);
                return Result.businessError(400, "用户不存在");
            }
            member.setPassword(hashedPassword);
            int updateResult = memberMapper.updateById(member);
            if (updateResult > 0) {
                System.out.println("密码更新成功: 成员ID=" + userId);
            } else {
                System.out.println("密码更新失败: 数据库更新失败, 成员ID=" + userId);
                return Result.businessError(500, "密码更新失败");
            }
        } else if (currentUser instanceof com.club.management.entity.SysUser) {
            com.club.management.entity.SysUser sysUser = sysUserMapper.selectById(userId);
            if (sysUser == null) {
                System.out.println("密码更新失败: 系统用户不存在, ID=" + userId);
                return Result.businessError(400, "用户不存在");
            }
            sysUser.setPassword(hashedPassword);
            int updateResult = sysUserMapper.updateById(sysUser);
            if (updateResult > 0) {
                System.out.println("密码更新成功: 系统用户ID=" + userId);
            } else {
                System.out.println("密码更新失败: 数据库更新失败, 系统用户ID=" + userId);
                return Result.businessError(500, "密码更新失败");
            }
        } else {
            System.out.println("密码更新失败: 未知用户类型, ID=" + userId);
            return Result.businessError(400, "用户类型错误");
        }
        
        return Result.success("密码修改成功");
    }
    
    /** 获取用户ID的辅助方法 */
    private Long getUserId(Object currentUser) {
        if (currentUser instanceof com.club.management.entity.Member) {
            return ((com.club.management.entity.Member) currentUser).getId();
        } else if (currentUser instanceof com.club.management.entity.SysUser) {
            return ((com.club.management.entity.SysUser) currentUser).getId();
        }
        return null;
    }
    
    /** 获取学号的辅助方法 */
    private String getStuId(Object currentUser) {
        if (currentUser instanceof com.club.management.entity.Member) {
            return ((com.club.management.entity.Member) currentUser).getStuId();
        } else if (currentUser instanceof com.club.management.entity.SysUser) {
            return ((com.club.management.entity.SysUser) currentUser).getStuId();
        }
        return null;
    }
    
}
