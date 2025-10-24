package com.club.management.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 活动附件表
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("activity_attachment")
public class ActivityAttachment {

    /**
     * 附件ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 活动ID
     */
    private Long activityId;

    /**
     * 文件存储名称
     */
    private String fileName;

    /**
     * 原始文件名
     */
    private String originalName;

    /**
     * 文件路径
     */
    private String filePath;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件类型
     */
    private String fileType;

    /**
     * 文件扩展名
     */
    private String fileExt;

    /**
     * 上传人ID
     */
    private Long uploadBy;

    /**
     * 上传时间
     */
    private LocalDateTime uploadTime;

    /**
     * 附件说明
     */
    private String description;

    /**
     * 下载次数
     */
    private Integer downloadCount;

    /**
     * 上传人姓名（查询时关联获取）
     */
    @TableField(exist = false)
    private String uploadByName;

    /**
     * 文件大小文本（如：1MB）
     */
    @TableField(exist = false)
    private String sizeText;

    /**
     * 是否可以删除
     */
    @TableField(exist = false)
    private Boolean canDelete;
}

