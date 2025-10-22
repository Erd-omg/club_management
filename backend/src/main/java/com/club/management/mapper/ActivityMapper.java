package com.club.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.club.management.entity.Activity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 活动Mapper接口
 */
@Mapper
public interface ActivityMapper extends BaseMapper<Activity> {

    /**
     * 分页查询活动信息
     */
    IPage<Activity> selectActivityPage(Page<Activity> page, @Param("name") String name,
                                      @Param("type") String type, @Param("deptId") Long deptId, @Param("status") Integer status,
                                      @Param("createBy") Long createBy, @Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime,
                                      @Param("sortField") String sortField, @Param("sortOrder") String sortOrder);

    /**
     * 获取活动的审批人信息
     */
    List<Map<String, Object>> selectActivityApprovers(@Param("activityId") Long activityId);

    /**
     * 获取活动的负责部门信息
     */
    List<Map<String, Object>> selectActivityDepts(@Param("activityId") Long activityId);

    /**
     * 获取活动的参与成员详细信息
     */
    List<Map<String, Object>> selectActivityMembersWithDetails(@Param("activityId") Long activityId);

    /**
     * 获取活动的参与成员
     */
    List<Map<String, Object>> selectActivityMembers(@Param("activityId") Long activityId);
}

