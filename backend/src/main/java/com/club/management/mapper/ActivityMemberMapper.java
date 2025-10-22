package com.club.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.club.management.entity.ActivityMember;
import org.apache.ibatis.annotations.Mapper;

/**
 * 活动参与记录Mapper接口
 */
@Mapper
public interface ActivityMemberMapper extends BaseMapper<ActivityMember> {
}

