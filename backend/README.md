# 社团管理系统后端

## 项目简介

社团管理系统后端，基于 Spring Boot 2.7 + MyBatis-Plus + JWT 技术栈开发。

## 技术栈

- Spring Boot 2.7.18
- MyBatis-Plus 3.5.3.1
- MySQL 8.0
- JWT认证
- Lombok
- Apache POI (Excel处理)
- iText (PDF处理)

## 项目结构

```
src/main/java/com/club/management/
├── ClubManagementApplication.java          # 启动类
├── common/                                # 通用类
│   ├── Result.java                        # 统一响应结果
│   ├── ErrorCode.java                     # 错误码常量
│   └── JwtUtil.java                       # JWT工具类
├── config/                                # 配置类
│   ├── WebConfig.java                     # Web配置（CORS、静态资源）
│   ├── SwaggerConfig.java                 # Swagger配置（已禁用，避免兼容性问题）
│   ├── MybatisPlusConfig.java             # MyBatis Plus配置
│   ├── SecurityConfig.java                # Spring Security配置
│   └── JwtAuthenticationFilter.java       # JWT认证过滤器
├── controller/                            # 控制器
│   ├── AuthController.java                # 认证控制器
│   ├── DeptController.java                # 部门管理控制器
│   ├── MemberController.java              # 社员管理控制器
│   ├── ActivityController.java            # 活动管理控制器
│   ├── UserController.java                # 用户管理控制器
│   ├── ExportController.java              # 导出功能控制器
│   ├── UploadController.java              # 文件上传控制器
│   └── StatisticsController.java          # 统计功能控制器
├── entity/                                # 实体类
│   ├── Dept.java                          # 部门实体
│   ├── SysUser.java                       # 系统用户实体
│   ├── Member.java                        # 社员实体
│   ├── Activity.java                      # 活动实体
│   ├── ActivityMember.java                # 活动参与记录实体
│   ├── ActivityApprover.java              # 活动审批人实体
│   ├── ActivityDept.java                  # 活动部门关联实体
│   ├── SysLog.java                        # 系统日志实体
│   └── SysMessage.java                    # 系统消息实体
├── mapper/                                # Mapper接口
│   ├── DeptMapper.java                    # 部门Mapper
│   ├── SysUserMapper.java                 # 系统用户Mapper
│   ├── MemberMapper.java                  # 社员Mapper
│   ├── ActivityMapper.java                # 活动Mapper
│   ├── ActivityMemberMapper.java          # 活动参与记录Mapper
│   ├── ActivityApproverMapper.java        # 活动审批人Mapper
│   ├── ActivityDeptMapper.java            # 活动部门关联Mapper
│   ├── SysLogMapper.java                  # 系统日志Mapper
│   └── SysMessageMapper.java              # 系统消息Mapper
├── service/                               # 服务层
│   ├── AuthService.java                   # 认证服务
│   ├── DeptService.java                   # 部门服务
│   ├── MemberService.java                 # 社员服务
│   ├── ActivityService.java               # 活动服务
│   ├── UserService.java                   # 用户服务
│   ├── ExportService.java                 # 导出服务
│   └── StatisticsService.java             # 统计服务
└── dto/                                   # 数据传输对象
    └── DeptCard.java                      # 部门卡片DTO
```

## 数据库配置

1. 确保MySQL服务已启动
2. 创建数据库：`club_management`
3. 执行建表语句（见PRD文档）
4. 执行初始化数据脚本：`src/main/resources/sql/init_data.sql`

## 运行说明

1. 确保已安装并使用 JDK 21（本项目已在 JDK 21 下运行）
2. 修改 `application.yml` 中的数据库连接信息
3. 首次运行建议：`mvn -DskipTests clean package`
4. 启动：`mvn spring-boot:run`（或执行根目录下 `backend/start_app.bat`）
5. 应用端口：`8081`，上下文路径：`/api`
6. Swagger 文档暂未启用（Springfox 与 Spring Boot 2.7 + JDK 21 存在兼容问题）

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/validate` - 验证token

### 部门管理
- `GET /api/dept/list` - 获取所有部门
- `GET /api/dept/cards` - 获取部门卡片（含成员数）
- `GET /api/dept/detail/{id}` - 获取部门详情
- `POST /api/dept/add` - 添加部门
- `PUT /api/dept/update` - 更新部门
- `DELETE /api/dept/delete/{id}` - 删除部门

### 社员管理
- `GET /api/member/page` - 分页查询社员
- `POST /api/member/add` - 添加社员
- `PUT /api/member/update` - 更新社员
- `DELETE /api/member/delete/{id}` - 删除社员
- `GET /api/member/detail/{id}` - 获取社员详情

### 活动管理
- `GET /api/activity/page` - 分页查询活动
- `POST /api/activity/add` - 添加活动
- `PUT /api/activity/update` - 更新活动
- `DELETE /api/activity/delete/{id}` - 删除活动
- `PUT /api/activity/approve/{id}` - 审批活动
- `PUT /api/activity/approve/{id}/self` - 当前用户审批活动
- `GET /api/activity/detail/{id}` - 获取活动详情
- `GET /api/activity/members/{activityId}` - 获取活动参与成员
- `PUT /api/activity/members/{activityId}` - 更新活动参与成员
- `POST /api/activity/signup/{activityId}` - 活动报名
- `DELETE /api/activity/signup/{activityId}` - 取消报名
- `GET /api/activity/signup/status/{activityId}` - 检查报名状态

### 用户管理
- `GET /api/user/search` - 搜索用户（用于审批人选择）
- `PUT /api/user/update` - 更新用户信息
- `PUT /api/user/change-password` - 修改密码

### 文件上传
- `POST /api/upload` - 文件上传

### 数据导出
- `POST /api/export/generate` - 生成导出包
- `GET /api/export/history` - 获取导出历史
- `GET /api/export/download/{id}` - 下载导出文件

### 统计功能
- `GET /api/statistics/dashboard` - 获取仪表板统计
- `GET /api/statistics/dept` - 获取部门统计
- `GET /api/statistics/activity` - 获取活动统计

## 测试账号

### 系统管理员
- 学号：admin
- 密码：password
- 角色：社长

### 社团成员（member表）
- 学号：2021001，密码：password，角色：社长
- 学号：2021002，密码：password，角色：副社长
- 学号：2021003，密码：password，角色：部长
- 学号：2021004，密码：password，角色：副部长
- 学号：2021005，密码：password，角色：干事
- 学号：2021006，密码：password，角色：指导老师

## 注意事项

1. 所有接口都需要 JWT 认证（除登录接口外）
2. 密码使用BCrypt加密存储
3. 登录失败5次会锁定30分钟
4. JWT token有效期为24小时
5. 支持跨域请求

## 最新功能更新

### 活动参与人员管理优化
- ✅ 修复了`updateActivityMembers`方法，实现真正的数据替换而非追加
- ✅ 优化了`getActivityMembers`方法，返回包含用户详细信息的完整数据
- ✅ 新增了`selectActivityMembers`SQL查询，获取完整的成员信息
- ✅ 完善了数据持久化机制，确保参与人员数据正确保存和删除

### 活动报名功能
- ✅ 实现了活动报名API (`POST /api/activity/signup/{activityId}`)
- ✅ 实现了取消报名API (`DELETE /api/activity/signup/{activityId}`)
- ✅ 实现了报名状态检查API (`GET /api/activity/signup/status/{activityId}`)
- ✅ 支持权限控制，指导老师不能报名活动

### 数据库优化
- ✅ 修复了MyBatis-Plus字段映射冲突问题
- ✅ 优化了数据库表结构，删除了不再使用的字段
- ✅ 改进了实体类设计，使用@TableField注解标记非数据库字段
- ✅ 实现了数据持久化的原子性操作

### 权限控制完善
- ✅ 根据角色控制仪表盘数据展示
- ✅ 干事角色权限限制（不能创建活动）
- ✅ 指导老师报名权限限制
- ✅ 多人审批状态显示优化

## 启动与健康检查

- Windows 一键启动（后台）：在 `backend` 目录执行：
  - `start /B mvn spring-boot:run`
- 健康校验：
  - `netstat -an | findstr :8081` 出现 LISTENING 即表示启动成功
  - 首次访问推荐：`POST /api/auth/login` 获取 JWT

## 注意事项

1. 所有接口都需要 JWT 认证（除登录接口外）
2. 密码使用BCrypt加密存储
3. 登录失败5次会锁定30分钟
4. JWT token有效期为24小时
5. 支持跨域请求
6. 活动参与人员管理功能已全面修复
7. 完全移除了消息系统相关功能
8. 活动报名功能支持权限控制

