package com.club.management.dto;

import lombok.Data;

@Data
public class DeptCard {
    private Long id;
    private String name;
    private String intro;        // 部门简介（可为空，需DB迁移后生效）
    private Integer memberCount; // 实时聚合
}
