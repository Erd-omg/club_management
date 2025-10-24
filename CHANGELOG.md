# 更新日志 (Changelog)

## [2025-10-25] - Project Improvements

### Changed
- **仪表盘显示优化**: 将"近期活动"改为"活动总数"，显示全部活动数量
- **角色字段显示**: 根据角色智能显示字段
  - 指导老师不显示"专业"、"年级"、"部门"
  - 社长、副社长不显示"部门"
  - 个人中心页面相应字段显示"无"
- **项目结构**: 统一使用根目录的 `uploads` 目录
- **README文档**: 完善配置说明和安全提示

### Security
- **隐藏敏感信息**: 数据库密码使用星号隐藏
- **配置提示**: 在README中添加详细的安全配置说明

### Technical Improvements
- **重置密码功能**: 管理员可在编辑社员信息时重置密码为学号后6位
- **数据库优化**: 指导老师的专业和年级字段设置为NULL
- **文件整理**: 删除不需要的编译文件和上传文件

## [Earlier Commits]

- Update README: Standardize test account IDs to 8 digits, improve documentation
- Update database_init.sql: Set dept_id to NULL for leader, vice-leader, and advisor roles
- Add password reset feature: Admin can reset passwords to last 6 digits of student ID
- Remove backend and frontend README files, content merged to root README
- Improve project: Set advisor major and grade to null, update project structure
- Optimize UI display: Show total activities in dashboard, update README structure
- Remove backend/uploads directory, use root-level uploads directory uniformly

