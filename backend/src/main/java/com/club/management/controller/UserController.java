package com.club.management.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.club.management.common.Result;
import com.club.management.entity.SysMessage;
import com.club.management.entity.SysUser;
import com.club.management.mapper.DeptMapper;
import com.club.management.mapper.MemberMapper;
import com.club.management.mapper.SysMessageMapper;
import com.club.management.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysMessageMapper sysMessageMapper;

    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private DeptMapper deptMapper;

    /** 按姓名或学号模糊检索 */
    @GetMapping("/search")
    public Result<List<Object>> search(@RequestParam String q,
                                       @RequestParam(required = false) String role) {
        List<Object> result = new ArrayList<>();
        
        // 搜索Member表
        QueryWrapper<com.club.management.entity.Member> memberQw = new QueryWrapper<>();
        memberQw.like("name", q).or().like("stu_id", q);
        if (role != null && !role.isEmpty()) {
            memberQw.eq("role", role);
        }
        List<com.club.management.entity.Member> memberList = memberMapper.selectList(memberQw);
        result.addAll(memberList);
        
        // 搜索SysUser表（系统管理员）
        QueryWrapper<SysUser> sysUserQw = new QueryWrapper<>();
        sysUserQw.like("name", q).or().like("stu_id", q);
        if (role != null && !role.isEmpty()) {
            sysUserQw.eq("role", role);
        }
        List<SysUser> sysUserList = sysUserMapper.selectList(sysUserQw);
        result.addAll(sysUserList);
        
        return Result.success(result);
    }

    /** 未读消息数量 */
    @GetMapping("/messages/unread/count")
    public Result<Long> unreadCount(@RequestAttribute("currentUser") Object currentUser) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.success(0L);
        }
        Long cnt = sysMessageMapper.selectCount(new QueryWrapper<SysMessage>().eq("recipient_id", userId).eq("status", 0));
        return Result.success(cnt);
    }

    /** 我的消息列表 */
    @GetMapping("/messages")
    public Result<List<SysMessage>> myMessages(@RequestAttribute("currentUser") Object currentUser) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.success(new java.util.ArrayList<>());
        }
        List<SysMessage> list = sysMessageMapper.selectList(new QueryWrapper<SysMessage>().eq("recipient_id", userId).orderByDesc("create_time"));
        return Result.success(list);
    }

    /** 标记消息为已读 */
    @PutMapping("/messages/{id}/read")
    public Result<String> markRead(@PathVariable Long id, @RequestAttribute("currentUser") Object currentUser) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.success("已处理");
        }
        SysMessage msg = sysMessageMapper.selectById(id);
        if (msg == null || !msg.getRecipientId().equals(userId)) {
            return Result.success("已处理");
        }
        if (msg.getStatus() != null && msg.getStatus() == 1) return Result.success("已处理");
        msg.setStatus(1);
        sysMessageMapper.updateById(msg);
        return Result.success("OK");
    }

    /** 全部标记为已读 */
    @PutMapping("/messages/read-all")
    public Result<String> markAllMessagesAsRead(@RequestAttribute("currentUser") Object currentUser) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.success("全部标记为已读");
        }
        SysMessage updateMessage = new SysMessage();
        updateMessage.setStatus(1); // 1-已读
        sysMessageMapper.update(updateMessage, new QueryWrapper<SysMessage>()
                .eq("recipient_id", userId)
                .eq("status", 0)); // 只更新未读消息
        return Result.success("全部标记为已读");
    }

    /** 删除消息 */
    @DeleteMapping("/messages/{id}")
    public Result<String> deleteMessage(@PathVariable Long id,
                                        @RequestAttribute("currentUser") Object currentUser) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.businessError(403, "无权操作此消息");
        }
        SysMessage message = sysMessageMapper.selectById(id);
        if (message == null || !message.getRecipientId().equals(userId)) {
            return Result.businessError(403, "无权操作此消息");
        }
        sysMessageMapper.deleteById(id);
        return Result.success("删除成功");
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
        
        String currentPassword = getPassword(currentUser);
        if (currentPassword == null) {
            return Result.businessError(400, "用户信息错误");
        }
        
        // 验证旧密码
        if (!org.springframework.security.crypto.bcrypt.BCrypt.checkpw(oldPassword, currentPassword)) {
            System.out.println("密码验证失败: 旧密码=" + oldPassword + ", 当前密码哈希=" + currentPassword);
            return Result.businessError(400, "原密码错误");
        }
        
        // 更新密码
        String hashedPassword = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(newPassword, 
            org.springframework.security.crypto.bcrypt.BCrypt.gensalt(10));
        
        if (currentUser instanceof com.club.management.entity.Member) {
            com.club.management.entity.Member member = (com.club.management.entity.Member) currentUser;
            member.setPassword(hashedPassword);
            memberMapper.updateById(member);
        } else if (currentUser instanceof com.club.management.entity.SysUser) {
            com.club.management.entity.SysUser sysUser = (com.club.management.entity.SysUser) currentUser;
            sysUser.setPassword(hashedPassword);
            sysUserMapper.updateById(sysUser);
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
    
    /** 获取密码的辅助方法 */
    private String getPassword(Object currentUser) {
        if (currentUser instanceof com.club.management.entity.Member) {
            return ((com.club.management.entity.Member) currentUser).getPassword();
        } else if (currentUser instanceof com.club.management.entity.SysUser) {
            return ((com.club.management.entity.SysUser) currentUser).getPassword();
        }
        return null;
    }
}
