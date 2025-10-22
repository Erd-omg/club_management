package com.club.management.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 活动参与记录表
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("activity_member")
public class ActivityMember {

    /**
     * 记录ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 活动ID
     */
    private Long activityId;

    /**
     * 社员ID
     */
    private Long memberId;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;

    /**
     * 报名时间
     */
    @TableField("signup_time")
    private LocalDateTime signupTime;

    /**
     * 报名状态: 0-已报名, 1-已确认, 2-已取消
     */
    @TableField("signup_status")
    private Integer signupStatus;

    /**
     * 出席状态: 0-未出席, 1-已出席, 2-请假
     */
    @TableField("attendance_status")
    private Integer attendanceStatus;

    /**
     * 备注信息
     */
    private String notes;
}

