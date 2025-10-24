-- 社团管理系统数据库初始化脚本
-- 说明: 本脚本用于初始化社团管理系统的数据库结构和测试数据

-- 创建数据库
CREATE DATABASE IF NOT EXISTS club_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE club_management;

-- 1. 创建部门表
CREATE TABLE IF NOT EXISTS dept (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '部门ID',
    name VARCHAR(50) NOT NULL COMMENT '部门名称',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    intro VARCHAR(500) COMMENT '部门简介'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 2. 创建成员表
CREATE TABLE IF NOT EXISTS member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '成员ID',
    stu_id VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender ENUM('男', '女') NOT NULL COMMENT '性别',
    college VARCHAR(100) NOT NULL COMMENT '学院',
    major VARCHAR(100) COMMENT '专业',
    grade ENUM('大一', '大二', '大三', '大四', '研一', '研二', '研三') COMMENT '年级',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    join_date DATE COMMENT '加入日期',
    leave_date DATE COMMENT '离开日期',
    dept_id BIGINT COMMENT '部门ID',
    role ENUM('社长', '副社长', '部长', '副部长', '干事', '指导老师') NOT NULL COMMENT '角色',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (dept_id) REFERENCES dept(id) ON DELETE SET NULL,
    FOREIGN KEY (create_by) REFERENCES member(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成员表';

-- 3. 创建系统用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    stu_id VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    role ENUM('社长', '副社长', '部长', '副部长', '干事', '指导老师') NOT NULL COMMENT '角色',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    login_attempts TINYINT DEFAULT 0 COMMENT '登录失败次数',
    lock_time DATETIME COMMENT '锁定时间',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (create_by) REFERENCES member(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 4. 创建活动表
CREATE TABLE IF NOT EXISTS activity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '活动ID',
    name VARCHAR(200) NOT NULL COMMENT '活动名称',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    location VARCHAR(200) COMMENT '活动地点',
    type ENUM('例会', '比赛', '志愿', '外出') NOT NULL COMMENT '活动类型',
    description TEXT COMMENT '活动描述',
    attachments JSON COMMENT '附件信息',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审批，1-已通过，2-已驳回',
    reject_reason VARCHAR(200) COMMENT '驳回理由',
    create_by BIGINT NOT NULL COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (create_by) REFERENCES member(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动表';

-- 5. 创建活动审批人表
CREATE TABLE IF NOT EXISTS activity_approver (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '审批记录ID',
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    user_id BIGINT NOT NULL COMMENT '审批人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    status TINYINT DEFAULT 0 COMMENT '审批状态：0-待审批，1-已通过，2-已驳回',
    approval_time DATETIME COMMENT '审批时间',
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES member(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动审批人表';

-- 6. 创建活动参与人员表
CREATE TABLE IF NOT EXISTS activity_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '参与记录ID',
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    member_id BIGINT NOT NULL COMMENT '成员ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    signup_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    signup_status TINYINT DEFAULT 0 COMMENT '报名状态: 0-已报名, 1-已确认, 2-已取消',
    notes VARCHAR(500) COMMENT '备注信息',
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动参与人员表';

-- 7. 创建活动负责部门表
CREATE TABLE IF NOT EXISTS activity_dept (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '负责部门记录ID',
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    dept_id BIGINT NOT NULL COMMENT '部门ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES dept(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动负责部门表';

-- 8. 创建活动附件表
CREATE TABLE IF NOT EXISTS activity_attachment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '附件ID',
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件存储名称',
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT NOT NULL COMMENT '文件大小（字节）',
    file_type VARCHAR(100) COMMENT '文件类型',
    file_ext VARCHAR(20) COMMENT '文件扩展名',
    upload_by BIGINT NOT NULL COMMENT '上传人ID',
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    description VARCHAR(500) COMMENT '附件说明',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE,
    FOREIGN KEY (upload_by) REFERENCES member(id) ON DELETE CASCADE,
    INDEX idx_activity_id (activity_id),
    INDEX idx_upload_by (upload_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动附件表';

-- 9. 创建导出历史表
CREATE TABLE IF NOT EXISTS export_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '导出记录ID',
    export_type ENUM('dept', 'member', 'activity', 'message') NOT NULL COMMENT '导出类型',
    export_format ENUM('excel', 'pdf') NOT NULL COMMENT '导出格式',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小',
    status INT DEFAULT 0 COMMENT '状态：0-处理中，1-已完成，2-失败',
    create_by BIGINT NOT NULL COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (create_by) REFERENCES member(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='导出历史表';

-- 10. 创建系统日志表
CREATE TABLE IF NOT EXISTS sys_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    operator VARCHAR(100) NOT NULL COMMENT '操作人',
    operation VARCHAR(200) NOT NULL COMMENT '操作内容',
    method VARCHAR(100) COMMENT '操作方法',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统日志表';


-- 插入测试数据

-- 插入部门数据
INSERT INTO dept (id, name, intro) VALUES
(1, '宣传部', '负责社团宣传工作，包括海报设计、活动推广等'),
(2, '技术部', '负责社团技术相关事务，包括网站维护、技术培训等'),
(3, '培训服务部', '负责社团培训服务工作，包括技能培训、服务活动等'),
(4, '办公室', '负责社团日常管理工作，包括文件管理、会议组织等');

-- 插入系统管理员
INSERT INTO sys_user (id, stu_id, name, password, role) VALUES
(1, 'admin', '系统管理员', '$2a$10$6jpu.5mC7/FTxoKO9Fr5W.IxAbK3gkyNeVQg62GNAEoV6xOuF7o5q', '社长');

-- 插入成员数据
-- 密码规则：学号后6位
-- 例如：学号20211001的密码为110001（学号后6位）
-- 所有密码均使用BCrypt加密存储
INSERT INTO member (id, stu_id, name, gender, college, major, grade, phone, email, join_date, leave_date, dept_id, role, password, create_by) VALUES
(1, '20211001', '张三', '男', '计算机学院', '计算机科学与技术', '大三', '13800138001', 'zhangsan@example.com', '2021-09-01', NULL, NULL, '社长', '$2b$12$NOBc8gYxng9G/rFlKM2xnO3s9rGnOAlspgIHbCYhSXYdGth.dnT8y', 1),
(2, '20211002', '李四', '女', '计算机学院', '软件工程', '大三', '13800138002', 'lisi@example.com', '2021-09-01', NULL, NULL, '副社长', '$2b$12$gzXAKeICKLMCwc/Mhzc1Gebo4cr/BcX8D7bw4f1EWHZS9KO6OAacG', 1),
(3, '20211003', '王五', '男', '计算机学院', '网络工程', '大二', '13800138003', 'wangwu@example.com', '2021-09-01', NULL, 2, '部长', '$2b$12$vseLRlpm.CJbrNF/6.SUNu34N6ocFOaRWT2RRCfXjxZpQEhylXvk6', 1),
(4, '20211004', '赵六', '女', '计算机学院', '信息安全', '大二', '13800138004', 'zhaoliu@example.com', '2021-09-01', NULL, 2, '副部长', '$2b$12$q8TcLJwocaggASxjqnla.OttZrCYropbnbPEVYCUspE/Xjyoqkyhm', 1),
(5, '20211005', '钱七', '男', '计算机学院', '数据科学与大数据技术', '大一', '13800138005', 'qianqi@example.com', '2021-09-01', NULL, 2, '干事', '$2b$12$atGrb7404pydtpj/hWHyhuGraWDYN6Gg.kMfozBZBKVDScUvS/r2m', 1),
(6, '20211006', '孙八', '女', '计算机学院', NULL, NULL, '13800138006', 'sunba@example.com', '2021-09-01', NULL, NULL, '指导老师', '$2b$12$1wMtMyjxqL.12uhK8jLO0uGtzgcIDaJlYuOl6OTncQI/qiXQxVoK.', 1),
(7, '20211007', '周九', '男', '计算机学院', '计算机科学与技术', '大二', '13800138007', 'zhoujiu@example.com', '2021-09-01', NULL, 3, '部长', '$2b$12$EsNypWiwhxq9jbMQilgd5uV6up7ODxOWLCpdauh7nBDRpsTtjqTKe', 1),
(8, '20211008', '吴十', '女', '计算机学院', '软件工程', '大二', '13800138008', 'wushi@example.com', '2021-09-01', NULL, 3, '副部长', '$2b$12$vfqdftATq2vWwpGPsXUhhO0rEfS2sDZWWZnfETwWgqzluUVpYmHa2', 1),
(9, '20211009', '郑十一', '男', '计算机学院', '网络工程', '大一', '13800138009', 'zhengshiyi@example.com', '2021-09-01', NULL, 3, '干事', '$2b$12$cQbJKg/ccmf2b4TNdJMhVuSjWDWCa1qKNljyOKAXjtUWwOO2TNqKm', 1),
(10, '20211010', '王十二', '女', '计算机学院', '信息安全', '大一', '13800138010', 'wangshier@example.com', '2021-09-01', NULL, 4, '部长', '$2b$12$dkVE4hrkmUntF5v8wqoeqOWjN2VPLG7xGuLjQjEFDIXroxn5k0xOq', 1),
(11, '20211011', '李十三', '男', '计算机学院', '数据科学与大数据技术', '大一', '13800138011', 'lishisan@example.com', '2021-09-01', NULL, 4, '副部长', '$2b$12$Tmaq.4jRqVh7ooC5ipuNSuAjco6lp2oGorH7Lrhpg8hrQ1cZD9j2W', 1),
(12, '20211012', '张十四', '女', '计算机学院', '人工智能', '大一', '13800138012', 'zhangshisi@example.com', '2021-09-01', NULL, 4, '干事', '$2b$12$PWFvoJ6PGio.80GnGroUGOyZ29zaGeZS6NU0r0ffSfxeiQWkDOhwq', 1),
(13, '20211013', '刘十五', '男', '计算机学院', '计算机科学与技术', '大一', '13800138013', 'liushiwu@example.com', '2021-09-01', NULL, 1, '部长', '$2b$12$TF2bF2iGYX04LE/MGxHU3uGAehwl/d424HbW1hcBymbgOKJ3NSdwy', 1),
(14, '20211014', '陈十六', '女', '计算机学院', '软件工程', '大一', '13800138014', 'chenshiliu@example.com', '2021-09-01', NULL, 1, '副部长', '$2b$12$GxCUM9Hf4QN/abyuP04iUukwh3mh/f3ER2S/gZPI5Wx4Mzn.f7nTO', 1),
(15, '20211015', '杨十七', '男', '计算机学院', '网络工程', '大一', '13800138015', 'yangshiqi@example.com', '2021-09-01', NULL, 1, '干事', '$2b$12$OrZpmLxiFMApdie3zoWK0OLtWXzJ2Z4XzEtcNBcWZZy/B.RxOhdhq', 1),
(16, '20211016', '黄十八', '女', '计算机学院', '信息安全', '大一', '13800138016', 'huangshiba@example.com', '2021-09-01', NULL, 2, '干事', '$2b$12$E2R1EnFkGqNoTxEQckxmGe1t0ZdU1S/Sxw4E954yjYsjbf.Wn5r5W', 1);

-- 插入活动数据
INSERT INTO activity (id, name, description, location, type, start_time, end_time, status, create_by) VALUES
(1, '技术分享会', '分享最新的技术趋势和开发经验', '教学楼A101', '例会', '2024-01-15 14:00:00', '2024-01-15 16:00:00', 1, 1),
(2, '编程竞赛', '面向全校的编程竞赛活动', '计算机实验室', '比赛', '2024-01-20 09:00:00', '2024-01-20 17:00:00', 1, 1),
(3, '社区志愿服务', '为社区提供技术支持和培训', '社区中心', '志愿', '2024-01-25 08:00:00', '2024-01-25 12:00:00', 0, 1),
(4, '技术交流活动', '与其他高校技术社团的交流活动', '外校', '外出', '2024-02-01 10:00:00', '2024-02-01 18:00:00', 0, 1);

-- 插入活动审批人数据
INSERT INTO activity_approver (activity_id, user_id, status, approval_time) VALUES
(1, 2, 1, '2024-01-10 10:00:00'),
(1, 6, 1, '2024-01-10 11:00:00'),
(2, 2, 1, '2024-01-15 09:00:00'),
(2, 6, 1, '2024-01-15 10:00:00'),
(3, 2, 0, NULL),
(3, 6, 0, NULL),
(4, 2, 0, NULL),
(4, 6, 0, NULL);

-- 插入活动参与人员数据
INSERT INTO activity_member (activity_id, member_id, signup_time, signup_status) VALUES
(1, 1, '2024-01-12 10:00:00', 1),
(1, 3, '2024-01-12 10:30:00', 1),
(1, 4, '2024-01-12 11:00:00', 1),
(1, 5, '2024-01-12 11:30:00', 1),
(2, 1, '2024-01-18 14:00:00', 1),
(2, 2, '2024-01-18 14:30:00', 1),
(2, 3, '2024-01-18 15:00:00', 1),
(2, 7, '2024-01-18 15:30:00', 1);

-- 插入活动负责部门数据
INSERT INTO activity_dept (activity_id, dept_id) VALUES
(1, 2),  -- 技术分享会由技术部负责
(2, 2),  -- 编程竞赛由技术部负责
(2, 1),  -- 编程竞赛也由宣传部负责
(3, 3),  -- 社区志愿服务由培训服务部负责
(4, 4);  -- 技术交流活动由办公室负责

-- 插入导出历史数据
INSERT INTO export_history (export_type, export_format, file_name, file_path, file_size, status, create_by) VALUES
('member', 'excel', '成员信息导出_20240101.xlsx', '/exports/member_20240101.xlsx', 1024000, 1, 1),
('activity', 'excel', '活动信息导出_20240101.xlsx', '/exports/activity_20240101.xlsx', 512000, 1, 1),
('dept', 'pdf', '部门信息导出_20240101.pdf', '/exports/dept_20240101.pdf', 256000, 1, 1);

-- 创建索引以提高查询性能
CREATE INDEX idx_member_stu_id ON member(stu_id);
CREATE INDEX idx_member_dept_id ON member(dept_id);
CREATE INDEX idx_member_role ON member(role);
CREATE INDEX idx_member_join_date ON member(join_date);
CREATE INDEX idx_start_time ON activity(start_time);
CREATE INDEX idx_type ON activity(type);
CREATE INDEX idx_activity_status ON activity(status);
CREATE INDEX idx_activity_approver_activity_id ON activity_approver(activity_id);
CREATE INDEX idx_activity_approver_user_id ON activity_approver(user_id);
CREATE INDEX idx_activity_id ON activity_member(activity_id);
CREATE INDEX idx_member_id ON activity_member(member_id);
CREATE UNIQUE INDEX uk_activity_member ON activity_member(activity_id, member_id);
CREATE INDEX idx_activity_attachment_activity_id ON activity_attachment(activity_id);
CREATE INDEX idx_activity_attachment_upload_by ON activity_attachment(upload_by);
CREATE INDEX idx_export_history_create_by ON export_history(create_by);
CREATE INDEX idx_sys_log_operator ON sys_log(operator);
CREATE INDEX idx_sys_log_operation ON sys_log(operation);
CREATE INDEX idx_sys_log_create_time ON sys_log(create_time);

-- 设置自增起始值
ALTER TABLE member AUTO_INCREMENT = 17;
ALTER TABLE activity AUTO_INCREMENT = 5;
ALTER TABLE export_history AUTO_INCREMENT = 4;

-- 完成数据库初始化
SELECT '数据库初始化完成！' AS message;
