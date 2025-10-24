package com.club.management.controller;

import com.club.management.common.Result;
import com.club.management.entity.Dept;
import com.club.management.service.DeptService;
import com.club.management.dto.DeptCard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 部门管理控制器
 */
@RestController
@RequestMapping("/dept")
public class DeptController {

    @Autowired
    private DeptService deptService;

    /** 获取所有部门（原） */
    @GetMapping("/list")
    public Result<List<Dept>> getAllDepts() {
        return deptService.getAllDepts();
    }

    /** 部门卡片列表（含成员数） */
    @GetMapping("/cards")
    public Result<List<DeptCard>> getDeptCards() {
        return deptService.getDeptCards();
    }

    /** 部门详情 */
    @GetMapping("/detail/{id}")
    public Result<Map<String, Object>> getDeptDetail(@PathVariable Long id) {
        return deptService.getDeptDetail(id);
    }

    /** 添加部门 */
    @PostMapping("/add")
    public Result<String> addDept(@RequestBody Dept dept) {
        return deptService.addDept(dept);
    }

    /** 更新部门 */
    @PutMapping("/update")
    public Result<String> updateDept(@RequestBody Dept dept) {
        return deptService.updateDept(dept);
    }

    /** 删除部门 */
    @DeleteMapping("/delete/{id}")
    public Result<String> deleteDept(@PathVariable Long id, @RequestAttribute("currentUser") Object currentUser) {
        return deptService.deleteDept(id, currentUser);
    }
}