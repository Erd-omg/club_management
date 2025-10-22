package com.club.management.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 活动-责任部门关系表
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("activity_dept")
public class ActivityDept {

    /** 主键ID */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 活动ID */
    private Long activityId;

    /** 部门ID */
    private Long deptId;

    /** 创建时间 */
    private LocalDateTime createTime;
}


