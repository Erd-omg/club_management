package com.club.management.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 系统用户表（登录认证）
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("sys_user")
public class SysUser {

    /**
     * 用户ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 学号/工号
     */
    private String stuId;

    /**
     * 姓名
     */
    private String name;

    /**
     * 角色
     */
    private String role;

    /**
     * 加密密码
     */
    private String password;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

    /**
     * 登录失败次数
     */
    private Integer loginAttempts;

    /**
     * 锁定时间
     */
    private LocalDateTime lockTime;

    /**
     * 创建人ID
     */
    private Long createBy;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}

