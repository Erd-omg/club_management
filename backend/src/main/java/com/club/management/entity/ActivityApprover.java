package com.club.management.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 活动-审批人关系表
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("activity_approver")
public class ActivityApprover {

    /** 主键ID */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 活动ID */
    private Long activityId;

    /** 审批人用户ID（sys_user.id） */
    private Long userId;

    /** 状态：0-待审，1-通过，2-驳回 */
    private Integer status;

    /** 审批时间 */
    private LocalDateTime approvalTime;

    /** 创建时间 */
    private LocalDateTime createTime;
}


