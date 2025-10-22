-- 社团管理系统数据库初始化脚本
-- 创建时间: 2024年
-- 版本: 1.0.0

-- 创建数据库
CREATE DATABASE IF NOT EXISTS club_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE club_management;

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS sys_log;
DROP TABLE IF EXISTS sys_message;
DROP TABLE IF EXISTS activity_member;
DROP TABLE IF EXISTS activity_approver;
DROP TABLE IF EXISTS activity_dept;
DROP TABLE IF EXISTS activity;
DROP TABLE IF EXISTS member;
DROP TABLE IF EXISTS dept;
DROP TABLE IF EXISTS sys_user;

-- 创建部门表
CREATE TABLE dept (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '部门名称',
    sort INT DEFAULT 0 COMMENT '排序',
    intro VARCHAR(500) DEFAULT '' COMMENT '部门简介',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- 创建用户表
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stu_id VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    role VARCHAR(20) NOT NULL COMMENT '角色',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用，0禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

-- 创建成员表
CREATE TABLE member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stu_id VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender VARCHAR(10) NOT NULL COMMENT '性别',
    college VARCHAR(100) NOT NULL COMMENT '学院',
    major VARCHAR(100) NOT NULL COMMENT '专业',
    grade VARCHAR(20) NOT NULL COMMENT '年级',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    email VARCHAR(100) DEFAULT '' COMMENT '邮箱',
    join_date DATE NOT NULL COMMENT '入社时间',
    dept_id BIGINT NOT NULL COMMENT '部门ID',
    role VARCHAR(20) NOT NULL COMMENT '角色',
    photo_oss_key VARCHAR(255) DEFAULT '' COMMENT '照片OSS键',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    leave_date DATE DEFAULT NULL COMMENT '离社时间',
    create_by BIGINT DEFAULT NULL COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_dept_id (dept_id),
    INDEX idx_role (role),
    INDEX idx_join_date (join_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成员表';

-- 创建活动表
CREATE TABLE activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '活动名称',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    location VARCHAR(200) DEFAULT '' COMMENT '地点',
    type VARCHAR(20) NOT NULL COMMENT '类型：例会/比赛/志愿/外出',
    description TEXT DEFAULT '' COMMENT '活动简介',
    status TINYINT DEFAULT 0 COMMENT '状态：0待审批，1通过，2驳回',
    reject_reason VARCHAR(500) DEFAULT '' COMMENT '驳回理由',
    create_by BIGINT NOT NULL COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_start_time (start_time),
    INDEX idx_status (status),
    INDEX idx_create_by (create_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

-- 创建活动参与人员表
CREATE TABLE activity_member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    member_id BIGINT NOT NULL COMMENT '成员ID',
    signup_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    signup_status TINYINT DEFAULT 1 COMMENT '报名状态：1已报名，0已取消',
    attendance_status TINYINT DEFAULT 0 COMMENT '出勤状态：1已出勤，0未出勤',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_activity_member (activity_id, member_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_member_id (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动参与人员表';

-- 创建活动审批人表
CREATE TABLE activity_approver (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    user_id BIGINT NOT NULL COMMENT '审批人ID',
    status TINYINT DEFAULT 0 COMMENT '审批状态：0待审批，1通过，2驳回',
    approval_time DATETIME DEFAULT NULL COMMENT '审批时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_activity_approver (activity_id, user_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动审批人表';

-- 创建活动负责部门表
CREATE TABLE activity_dept (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    dept_id BIGINT NOT NULL COMMENT '部门ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_activity_dept (activity_id, dept_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_dept_id (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动负责部门表';

-- 创建系统消息表
CREATE TABLE sys_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipient_id BIGINT NOT NULL COMMENT '接收人ID',
    sender_id BIGINT NOT NULL COMMENT '发送人ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    status TINYINT DEFAULT 0 COMMENT '状态：0未读，1已读',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统消息表';

-- 创建系统日志表
CREATE TABLE sys_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    operator VARCHAR(50) NOT NULL COMMENT '操作人',
    operation VARCHAR(100) NOT NULL COMMENT '操作',
    method VARCHAR(200) NOT NULL COMMENT '方法',
    params TEXT DEFAULT '' COMMENT '参数',
    ip VARCHAR(50) DEFAULT '' COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_operator (operator),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- 插入初始部门数据
INSERT INTO dept (name, sort, intro) VALUES
('宣传部', 1, '负责社团活动的宣传推广，包括海报设计、活动宣传、媒体运营等工作'),
('技术部', 2, '负责社团技术相关活动，包括技术培训、项目开发、技术交流等工作'),
('培训服务部', 3, '负责社团培训活动，包括技能培训、知识分享、学习交流等工作'),
('办公室', 4, '负责社团日常管理，包括财务管理、档案管理、活动协调等工作');

-- 插入初始用户数据
INSERT INTO sys_user (stu_id, name, role, password, status) VALUES
('admin', '系统管理员', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021001', '张三', '社长', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021002', '李四', '副社长', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021003', '王五', '部长', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021004', '赵六', '副部长', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021005', '钱七', '干事', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021006', '孙八', '指导老师', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1);

-- 插入初始成员数据
INSERT INTO member (stu_id, name, gender, college, major, grade, phone, email, join_date, dept_id, role, password, create_by) VALUES
('2021001', '张三', '男', '计算机学院', '软件工程', '大三', '13800138001', 'zhangsan@example.com', '2021-09-01', 1, '社长', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021002', '李四', '女', '计算机学院', '计算机科学与技术', '大三', '13800138002', 'lisi@example.com', '2021-09-01', 2, '副社长', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021003', '王五', '男', '计算机学院', '软件工程', '大二', '13800138003', 'wangwu@example.com', '2021-09-01', 1, '部长', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021004', '赵六', '女', '计算机学院', '计算机科学与技术', '大二', '13800138004', 'zhaoliu@example.com', '2021-09-01', 2, '副部长', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021005', '钱七', '男', '计算机学院', '软件工程', '大一', '13800138005', 'qianqi@example.com', '2021-09-01', 3, '干事', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021006', '孙八', '女', '计算机学院', '计算机科学与技术', '研一', '13800138006', 'sunba@example.com', '2021-09-01', 4, '指导老师', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021007', '周九', '男', '计算机学院', '软件工程', '大一', '13800138007', 'zhoujiu@example.com', '2021-09-01', 1, '干事', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1),
('2021008', '吴十', '女', '计算机学院', '计算机科学与技术', '大一', '13800138008', 'wushi@example.com', '2021-09-01', 2, '干事', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 1);

-- 插入初始活动数据
INSERT INTO activity (name, start_time, end_time, location, type, description, status, create_by) VALUES
('社团招新活动', '2024-09-15 09:00:00', '2024-09-15 17:00:00', '学生活动中心', '志愿', '面向全校学生的社团招新活动，展示社团特色，吸引新成员加入', 1, 1),
('技术分享会', '2024-09-20 19:00:00', '2024-09-20 21:00:00', '计算机学院报告厅', '例会', '邀请行业专家分享最新技术趋势，提升成员技术水平', 1, 1),
('编程比赛', '2024-10-01 09:00:00', '2024-10-01 18:00:00', '计算机实验室', '比赛', '面向全校学生的编程比赛，提升编程能力和团队协作能力', 0, 1),
('户外拓展', '2024-10-15 08:00:00', '2024-10-15 17:00:00', '森林公园', '外出', '组织成员进行户外拓展活动，增强团队凝聚力和身体素质', 0, 1);

-- 插入活动参与人员数据
INSERT INTO activity_member (activity_id, member_id, signup_time, signup_status, attendance_status) VALUES
(1, 1, '2024-09-10 10:00:00', 1, 1),
(1, 2, '2024-09-10 10:30:00', 1, 1),
(1, 3, '2024-09-10 11:00:00', 1, 1),
(1, 4, '2024-09-10 11:30:00', 1, 1),
(2, 1, '2024-09-15 15:00:00', 1, 1),
(2, 2, '2024-09-15 15:30:00', 1, 1),
(2, 5, '2024-09-15 16:00:00', 1, 1),
(2, 7, '2024-09-15 16:30:00', 1, 1);

-- 插入活动审批人数据
INSERT INTO activity_approver (activity_id, user_id, status, approval_time) VALUES
(1, 6, 1, '2024-09-12 10:00:00'),
(2, 6, 1, '2024-09-18 15:00:00'),
(3, 6, 0, NULL),
(4, 6, 0, NULL);

-- 插入活动负责部门数据
INSERT INTO activity_dept (activity_id, dept_id) VALUES
(1, 1),
(2, 2),
(3, 2),
(4, 3);

-- 插入系统消息数据
INSERT INTO sys_message (recipient_id, sender_id, title, content, status) VALUES
(1, 6, '活动审批通知', '您的活动"编程比赛"已提交审批，请等待审批结果', 0),
(1, 6, '活动审批通知', '您的活动"户外拓展"已提交审批，请等待审批结果', 0);

-- 插入系统日志数据
INSERT INTO sys_log (operator, operation, method, params, ip) VALUES
('admin', '用户登录', 'POST /api/auth/login', '{"stuId":"admin"}', '127.0.0.1'),
('张三', '创建活动', 'POST /api/activity/add', '{"name":"社团招新活动"}', '127.0.0.1'),
('李四', '审批活动', 'PUT /api/activity/approve/1', '{"status":1}', '127.0.0.1');

-- 创建视图：成员统计
CREATE VIEW member_stats AS
SELECT 
    d.name as dept_name,
    COUNT(m.id) as member_count,
    COUNT(CASE WHEN m.role = '社长' THEN 1 END) as president_count,
    COUNT(CASE WHEN m.role = '副社长' THEN 1 END) as vice_president_count,
    COUNT(CASE WHEN m.role = '部长' THEN 1 END) as minister_count,
    COUNT(CASE WHEN m.role = '副部长' THEN 1 END) as vice_minister_count,
    COUNT(CASE WHEN m.role = '干事' THEN 1 END) as member_count_role,
    COUNT(CASE WHEN m.role = '指导老师' THEN 1 END) as teacher_count
FROM dept d
LEFT JOIN member m ON d.id = m.dept_id AND m.leave_date IS NULL
GROUP BY d.id, d.name, d.sort
ORDER BY d.sort;

-- 创建视图：活动统计
CREATE VIEW activity_stats AS
SELECT 
    a.id,
    a.name,
    a.start_time,
    a.end_time,
    a.type,
    a.status,
    COUNT(am.id) as participant_count,
    COUNT(CASE WHEN am.attendance_status = 1 THEN 1 END) as attendance_count
FROM activity a
LEFT JOIN activity_member am ON a.id = am.activity_id AND am.signup_status = 1
GROUP BY a.id, a.name, a.start_time, a.end_time, a.type, a.status;

-- 创建存储过程：获取用户权限
DELIMITER //
CREATE PROCEDURE GetUserPermissions(IN user_id BIGINT)
BEGIN
    SELECT 
        u.id,
        u.stu_id,
        u.name,
        u.role,
        CASE 
            WHEN u.role = 'admin' THEN 'all'
            WHEN u.role = '社长' THEN 'all'
            WHEN u.role = '副社长' THEN 'all'
            WHEN u.role = '部长' THEN 'dept'
            WHEN u.role = '副部长' THEN 'read'
            WHEN u.role = '干事' THEN 'self'
            WHEN u.role = '指导老师' THEN 'approve'
            ELSE 'none'
        END as permission_level
    FROM sys_user u
    WHERE u.id = user_id AND u.status = 1;
END //
DELIMITER ;

-- 创建触发器：更新活动状态
DELIMITER //
CREATE TRIGGER update_activity_status
AFTER UPDATE ON activity_approver
FOR EACH ROW
BEGIN
    DECLARE total_approvers INT;
    DECLARE approved_count INT;
    DECLARE rejected_count INT;
    
    -- 获取审批人总数
    SELECT COUNT(*) INTO total_approvers
    FROM activity_approver
    WHERE activity_id = NEW.activity_id;
    
    -- 获取已通过审批数
    SELECT COUNT(*) INTO approved_count
    FROM activity_approver
    WHERE activity_id = NEW.activity_id AND status = 1;
    
    -- 获取已驳回审批数
    SELECT COUNT(*) INTO rejected_count
    FROM activity_approver
    WHERE activity_id = NEW.activity_id AND status = 2;
    
    -- 更新活动状态
    IF rejected_count > 0 THEN
        UPDATE activity SET status = 2 WHERE id = NEW.activity_id;
    ELSEIF approved_count = total_approvers THEN
        UPDATE activity SET status = 1 WHERE id = NEW.activity_id;
    END IF;
END //
DELIMITER ;

-- 创建索引优化查询性能
CREATE INDEX idx_member_dept_role ON member(dept_id, role);
CREATE INDEX idx_activity_time_status ON activity(start_time, status);
CREATE INDEX idx_activity_member_signup ON activity_member(activity_id, signup_status);
CREATE INDEX idx_sys_message_recipient_status ON sys_message(recipient_id, status);

-- 设置字符集和排序规则
ALTER DATABASE club_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 显示创建结果
SELECT 'Database initialization completed successfully!' as message;
SELECT COUNT(*) as dept_count FROM dept;
SELECT COUNT(*) as user_count FROM sys_user;
SELECT COUNT(*) as member_count FROM member;
SELECT COUNT(*) as activity_count FROM activity;
SELECT COUNT(*) as activity_member_count FROM activity_member;
SELECT COUNT(*) as activity_approver_count FROM activity_approver;
SELECT COUNT(*) as activity_dept_count FROM activity_dept;
SELECT COUNT(*) as sys_message_count FROM sys_message;
SELECT COUNT(*) as sys_log_count FROM sys_log;
