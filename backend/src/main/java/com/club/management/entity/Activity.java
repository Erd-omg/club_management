package com.club.management.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 活动信息表
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("activity")
public class Activity {

    /**
     * 活动ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 活动名称
     */
    private String name;

    /**
     * 开始时间
     */
    @TableField("start_time")
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    @TableField("end_time")
    private LocalDateTime endTime;

    /**
     * 活动类型
     */
    private String type;


    /**
     * 活动地点
     */
    private String location;

    /**
     * 活动简介
     */
    private String description;


    /**
     * 附件信息
     */
    private String attachments;

    /**
     * 状态：0-待审批，1-通过，2-驳回
     */
    private Integer status;

    /**
     * 驳回理由
     */
    private String rejectReason;

    /**
     * 创建人ID
     */
    @TableField("create_by")
    private Long createBy;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private LocalDateTime updateTime;

    /**
     * 负责部门名称（查询时关联获取）
     */
    @TableField(exist = false)
    private String deptNames;

    /**
     * 审批人信息（查询时关联获取）
     */
    @TableField(exist = false)
    private List<Map<String, Object>> approvers;
}

