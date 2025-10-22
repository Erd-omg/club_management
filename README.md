# 社团管理系统 (Club Management System)

> 一个基于Vue2 + SpringBoot的轻量级社团管理系统，专为高校社团日常管理设计。

## 📋 项目概述

本系统旨在解决高校社团日常管理中的痛点，提供一套"校内网可用、社长可维护、一页就能看懂"的轻量级社团管理解决方案。

### 🎯 核心功能

- **社员档案管理** - 支持单条维护、批量导入、信息查询
- **部门管理** - 部门信息维护、成员分配、活动负责
- **活动管理** - 活动创建、审批流程、参与记录
- **活动参与管理** - 报名/取消报名、参与人员管理、状态跟踪
- **统计报表** - 参与统计、出勤率分析、数据可视化
- **数据导出** - 换届交接包生成、Excel/PDF导出
- **个人中心** - 个人信息编辑、密码修改

### 🏗️ 技术架构

#### 后端技术栈
- **框架**: Spring Boot 2.7
- **数据库**: MySQL 8.0
- **ORM**: MyBatis-Plus
- **安全**: Spring Security + JWT
- **文档**: Swagger 3
- **构建**: Maven

#### 前端技术栈
- **框架**: Vue 2.6
- **路由**: Vue Router
- **状态管理**: Vuex
- **UI组件**: Element UI
- **构建工具**: Vue CLI
- **测试**: Playwright

## 🚀 快速开始

### 环境要求

- **Java**: JDK 21+
- **Node.js**: 16+
- **MySQL**: 8.0+
- **Maven**: 3.6+

### 安装步骤

#### 1. 克隆项目
```bash
git clone https://github.com/Erd-omg/club_management.git
cd club_management
```

#### 2. 数据库初始化
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE club_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入初始化数据
mysql -u root -p club_management < backend/src/main/resources/sql/init_data.sql
```

#### 3. 后端启动
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### 4. 前端启动
```bash
cd frontend
npm install
npm run serve
```

#### 5. 访问系统
- 前端地址: http://localhost:5174
- 后端地址: http://localhost:8081
- 默认账号: admin / password

## 📁 项目结构

```
club_management/
├── backend/                 # 后端项目
│   ├── src/main/java/      # Java源码
│   ├── src/main/resources/ # 配置文件
│   └── pom.xml            # Maven配置
├── frontend/               # 前端项目
│   ├── src/               # Vue源码
│   ├── public/            # 静态资源
│   └── package.json       # 依赖配置
├── docs/                  # 项目文档
│   ├── PRD.md            # 需求规格说明书
│   ├── SDS.md            # 功能设计说明书
│   ├── PROJECT_SUMMARY.md # 项目总结
│   ├── TEST_REPORT.md     # 测试报告
│   └── problems_and_solutions.md # 问题解决方案
└── README.md              # 项目说明
```

## 🔧 功能特性

### 角色权限管理
- **社长**: 全权限管理
- **副社长**: 除账号管理外的全权限
- **部长**: 本部门成员管理、活动创建
- **副部长**: 只读权限、数据导出
- **干事**: 个人档案管理、活动查看
- **指导老师**: 活动审批、数据查看

### 核心功能模块

#### 1. 社员档案管理
- ✅ 个人信息维护
- ✅ 批量导入功能
- ✅ 必填项标注
- ✅ 数据验证

#### 2. 活动管理
- ✅ 活动创建/编辑
- ✅ 多人审批流程
- ✅ 活动参与管理
- ✅ 报名/取消报名
- ✅ 参与人员管理

#### 3. 统计报表
- ✅ 参与统计
- ✅ 出勤率分析
- ✅ 数据可视化
- ✅ 仪表盘展示

#### 4. 数据导出
- ✅ Excel导出
- ✅ PDF生成
- ✅ 换届交接包
- ✅ 数据备份

## 🧪 测试

### 自动化测试
```bash
# 前端测试
cd frontend
npm run test

# 后端测试
cd backend
mvn test
```

### 手动测试
详细的测试指南请参考 [USER_TESTING_GUIDE.md](USER_TESTING_GUIDE.md)

## 📚 文档

- [需求规格说明书](PRD.md) - 详细的功能需求说明
- [功能设计说明书](SDS.md) - 系统架构和设计说明
- [项目总结](PROJECT_SUMMARY.md) - 开发进度和功能总结
- [测试报告](TEST_REPORT.md) - 测试结果和问题修复
- [问题解决方案](problems_and_solutions.md) - 开发过程中的问题解决记录
- [用户测试指南](USER_TESTING_GUIDE.md) - 完整的测试步骤说明

## 🔧 开发指南

### 后端开发
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

### 前端开发
```bash
cd frontend
npm install
npm run serve
```

### 数据库迁移
```bash
# 运行数据库迁移脚本
mysql -u root -p club_management < backend/src/main/resources/sql/migrations/V002__dept_intro_and_activity_approver.sql
```

## 🚀 部署

### 生产环境部署
```bash
# 后端打包
cd backend
mvn clean package -DskipTests
java -jar target/club-management-1.0.0.jar

# 前端构建
cd frontend
npm run build
```

### Docker部署
```bash
# 构建镜像
docker build -t club-management .

# 运行容器
docker run -p 8081:8081 -p 5174:5174 club-management
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目链接: [https://github.com/Erd-omg/club_management](https://github.com/Erd-omg/club_management)
- 问题反馈: [Issues](https://github.com/Erd-omg/club_management/issues)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和测试人员。

---

**注意**: 本系统专为高校社团管理设计，请确保在合规的环境下使用。
