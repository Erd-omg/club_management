package com.club.management.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 系统操作日志表
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("sys_log")
public class SysLog {

    /**
     * 日志ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 操作人
     */
    private String operator;

    /**
     * 操作内容
     */
    private String operation;

    /**
     * 操作方法
     */
    private String method;

    /**
     * 请求参数
     */
    private String params;

    /**
     * IP地址
     */
    private String ip;

    /**
     * 操作时间
     */
    private LocalDateTime createTime;
}

