package com.club.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.club.management.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * 系统用户Mapper接口
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
}

