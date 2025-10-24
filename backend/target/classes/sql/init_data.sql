-- 初始化部门数据
INSERT INTO dept (name, sort, create_time, update_time) VALUES
('宣传部', 1, NOW(), NOW()),
('技术部', 2, NOW(), NOW()),
('培训服务部', 3, NOW(), NOW()),
('办公室', 4, NOW(), NOW());

-- 初始化系统用户（社长账号）
INSERT INTO sys_user (stu_id, name, role, password, status, login_attempts, create_time, update_time) VALUES
('admin', '系统管理员', '社长', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1, 0, NOW(), NOW());

-- 初始化社员数据（示例）
INSERT INTO member (stu_id, name, gender, college, major, grade, phone, email, join_date, dept_id, role, create_by, create_time, update_time) VALUES
('2021001', '张三', '男', '计算机学院', '软件工程', '2021级', '13800138001', 'zhangsan@example.com', '2021-09-01', 1, '社长', 1, NOW(), NOW()),
('2021002', '李四', '女', '计算机学院', '计算机科学与技术', '2021级', '13800138002', 'lisi@example.com', '2021-09-01', 2, '副社长', 1, NOW(), NOW()),
('2021003', '王五', '男', '计算机学院', '软件工程', '2022级', '13800138003', 'wangwu@example.com', '2022-09-01', 1, '部长', 1, NOW(), NOW()),
('2021004', '赵六', '女', '计算机学院', '计算机科学与技术', '2022级', '13800138004', 'zhaoliu@example.com', '2022-09-01', 2, '副部长', 1, NOW(), NOW()),
('2021005', '钱七', '男', '计算机学院', '软件工程', '2023级', '13800138005', 'qianqi@example.com', '2023-09-01', 3, '干事', 1, NOW(), NOW());

