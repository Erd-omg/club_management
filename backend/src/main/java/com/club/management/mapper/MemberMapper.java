package com.club.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.club.management.entity.Member;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 社员Mapper接口
 */
@Mapper
public interface MemberMapper extends BaseMapper<Member> {

    /**
     * 分页查询社员信息（带部门名称）
     */
    IPage<Member> selectMemberPage(Page<Member> page, @Param("name") String name, 
                                   @Param("stuId") String stuId, @Param("deptId") Long deptId, 
                                   @Param("role") String role);

    /**
     * 获取社员参与的活动
     */
    List<Map<String, Object>> selectMemberActivities(@Param("memberId") Long memberId);
}

