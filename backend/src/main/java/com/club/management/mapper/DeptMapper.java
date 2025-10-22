package com.club.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.club.management.entity.Dept;
import com.club.management.dto.DeptCard;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 部门Mapper接口
 */
@Mapper
public interface DeptMapper extends BaseMapper<Dept> {

    @Select("SELECT d.id, d.name, d.intro, (SELECT COUNT(1) FROM member m WHERE m.dept_id = d.id) AS memberCount FROM dept d ORDER BY d.id ASC")
    List<DeptCard> selectDeptCards();

    @Select("SELECT a.id, a.name, a.type, a.start_time as startTime, a.end_time as endTime, a.status, a.create_time as createTime " +
            "FROM activity a " +
            "INNER JOIN activity_dept ad ON a.id = ad.activity_id " +
            "WHERE ad.dept_id = #{deptId} " +
            "ORDER BY a.create_time DESC " +
            "LIMIT 10")
    List<Map<String, Object>> selectDeptActivities(@Param("deptId") Long deptId);
}

