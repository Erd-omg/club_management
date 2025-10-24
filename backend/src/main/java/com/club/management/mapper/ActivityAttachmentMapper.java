package com.club.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.club.management.entity.ActivityAttachment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 活动附件Mapper
 */
@Mapper
public interface ActivityAttachmentMapper extends BaseMapper<ActivityAttachment> {

    /**
     * 查询活动的附件列表（包含上传人信息）
     */
    List<ActivityAttachment> selectAttachmentListByActivityId(@Param("activityId") Long activityId);

    /**
     * 增加下载次数
     */
    int incrementDownloadCount(@Param("id") Long id);
}

