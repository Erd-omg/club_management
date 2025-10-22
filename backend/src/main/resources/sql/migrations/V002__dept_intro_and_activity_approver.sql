-- Dept add intro column
ALTER TABLE dept ADD COLUMN intro VARCHAR(500) NULL;

-- Activity approver relation table
CREATE TABLE IF NOT EXISTS activity_approver (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  activity_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 0,
  approval_time DATETIME NULL,
  INDEX idx_activity_id (activity_id),
  INDEX idx_user_id (user_id)
);

-- 保证同一活动同一审批人唯一
CREATE UNIQUE INDEX IF NOT EXISTS ux_activity_approver_activity_user ON activity_approver(activity_id, user_id);

-- Activity responsible departments relation table
CREATE TABLE IF NOT EXISTS activity_dept (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  activity_id BIGINT NOT NULL,
  dept_id BIGINT NOT NULL,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_act_dept_activity_id (activity_id),
  INDEX idx_act_dept_dept_id (dept_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_activity_dept_activity_dept ON activity_dept(activity_id, dept_id);

-- Sys message table for in-site notifications
CREATE TABLE IF NOT EXISTS sys_message (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  recipient_id BIGINT NOT NULL,
  sender_id BIGINT NULL,
  title VARCHAR(100) NOT NULL,
  content VARCHAR(2000) NOT NULL,
  status TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
