package com.club.management.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 站内信通知
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("sys_message")
public class SysMessage {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long recipientId;

    private Long senderId;

    private String title;

    private String content;

    /** 0未读/1已读 */
    private Integer status;

    private LocalDateTime createTime;
}


