-- 为member表添加缺失字段
ALTER TABLE member ADD COLUMN password VARCHAR(255) NULL COMMENT '密码';
ALTER TABLE member ADD COLUMN leave_date DATE NULL COMMENT '离社时间';

-- 为activity表添加缺失字段
ALTER TABLE activity ADD COLUMN location VARCHAR(200) NULL COMMENT '活动地点';
ALTER TABLE activity ADD COLUMN sign_method VARCHAR(30) NULL COMMENT '签到方式';
ALTER TABLE activity ADD COLUMN attachments TEXT NULL COMMENT '附件信息';

-- 为dept表添加intro字段（如果不存在）
ALTER TABLE dept ADD COLUMN intro VARCHAR(500) NULL COMMENT '部门简介';

-- 更新activity_approver表，确保字段完整
ALTER TABLE activity_approver MODIFY COLUMN status TINYINT DEFAULT 0 COMMENT '状态：0-待审，1-通过，2-驳回';
ALTER TABLE activity_approver MODIFY COLUMN approval_time DATETIME NULL COMMENT '审批时间';
