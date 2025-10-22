package com.club.management.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 社员详细信息表
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("member")
public class Member {

    /**
     * 社员ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 学号
     */
    private String stuId;

    /**
     * 姓名
     */
    private String name;

    /**
     * 性别
     */
    private String gender;

    /**
     * 学院
     */
    private String college;

    /**
     * 专业
     */
    private String major;

    /**
     * 年级
     */
    private String grade;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 入社时间
     */
    private LocalDate joinDate;

    /**
     * 部门ID
     */
    private Long deptId;

    /**
     * 部门名称（查询时关联获取）
     */
    @TableField(exist = false)
    private String deptName;

    /**
     * 角色
     */
    private String role;


    /**
     * 密码
     */
    private String password;

    /**
     * 离社时间
     */
    private LocalDate leaveDate;

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

