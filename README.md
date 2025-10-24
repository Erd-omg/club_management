# 社团管理系统

一个专为高校社团设计的现代化管理系统，基于Spring Boot + Vue2技术栈开发，实现了成员管理、活动管理、部门管理、数据导出等核心功能。系统采用基于角色的权限控制，支持多种用户角色和细粒度权限管理。

## 🚀 项目特色

- **完整的权限控制体系**：支持6种用户角色，细粒度权限管理
- **多签审批流程**：支持复杂的活动审批流程，确保审批严谨性
- **活动参与管理**：完整的报名、取消报名、参与人员管理功能
- **数据可视化**：集成ECharts图表，提供直观的统计展示
- **响应式设计**：支持桌面端、平板端、手机端多设备访问
- **自动化测试**：全面的UI自动化测试覆盖

## 🛠 技术栈

### 后端技术
- **框架**: Spring Boot 2.7.18
- **数据库**: MySQL 8.0
- **ORM**: MyBatis-Plus 3.5.3.1
- **认证**: JWT + Spring Security
- **文档处理**: Apache POI (Excel) + iText (PDF)
- **构建工具**: Maven
- **JDK版本**: JDK 21

### 前端技术
- **框架**: Vue 2.6.14 + Vue Router + Vuex
- **UI组件**: Element UI 2.15.14
- **HTTP客户端**: Axios 0.27.2
- **图表库**: ECharts 5.4.3
- **样式预处理**: Sass
- **构建工具**: Vue CLI 4

### 测试框架
- **UI自动化测试**: Playwright
- **浏览器支持**: Firefox, Chrome
- **测试报告**: HTML, JSON, JUnit

## 📋 功能模块

### 核心功能
- ✅ **用户认证**：JWT token认证、多用户类型支持
- ✅ **成员管理**：CRUD操作、批量导入、权限隔离
- ✅ **部门管理**：部门信息管理、成员统计
- ✅ **活动管理**：活动创建、多签审批、参与管理、附件管理
- ✅ **数据导出**：Excel/PDF导出、导出历史管理
- ✅ **个人中心**：信息编辑、密码修改
- ✅ **统计图表**：实时统计、数据可视化

### 权限控制
| 角色 | 查看档案 | 编辑档案 | 创建活动 | 审批活动 | 导出数据 |
|------|----------|----------|----------|----------|----------|
| 社长 | 全部 | 全部 | ✅ | ✅ | ✅ |
| 副社长 | 全部 | 全部 | ✅ | ✅ | ✅ |
| 部长 | 本部门 | 本部门 | ✅ | ❌ | ✅ |
| 副部长 | 本部门 | ❌ | ❌ | ❌ | ✅ |
| 干事 | 自己 | 自己 | ❌ | ❌ | ❌ |
| 指导老师 | 全部 | ❌ | ❌ | ✅ | ✅ |

## 🚀 快速开始

### 环境要求
- JDK 21
- Node.js 16+
- MySQL 8.0
- Maven 3.6+

### 1. 克隆项目
```bash
git clone https://github.com/Erd-omg/club_management.git
cd club_management
```

### 2. 数据库初始化
```bash
# 创建数据库并初始化表结构
mysql -u root -p < database_init.sql
```

**注意事项**：
- 数据库初始化脚本位于项目根目录：`database_init.sql`
- 确保MySQL版本 >= 5.7（支持JSON类型）
- 默认创建数据库名：`club_management`
- 字符集：`utf8mb4`
- 详细数据库结构说明请查看：`DATABASE_SCHEMA_FINAL.md`

### 3. 启动后端服务
```bash
cd backend
mvn clean package -DskipTests
java -jar target/club-management-1.0.0.jar
```

### 4. 启动前端服务
```bash
cd frontend
npm install
npm run serve
```

### 5. 访问系统
- 前端地址: http://localhost:5174
- 后端API: http://localhost:8081/api

## 👥 测试账号

| 角色 | 学号 | 密码 | 权限说明 |
|------|------|------|----------|
| 系统管理员 | admin | password | 全权限 |
| 社长 | 2021001 | password | 全权限 |
| 副社长 | 2021002 | password | 管理权限 |
| 部长 | 2021003 | password | 部门权限 |
| 副部长 | 2021004 | password | 查看权限 |
| 干事 | 2021005 | password | 个人权限 |
| 指导老师 | 2021006 | password | 审批权限 |

## 📁 项目结构

```
club-management/
├── backend/                    # 后端项目
│   ├── src/main/java/         # Java源码
│   │   └── com/club/management/
│   │       ├── controller/     # 控制器
│   │       ├── service/        # 业务逻辑
│   │       ├── entity/         # 实体类
│   │       ├── mapper/         # 数据访问
│   │       └── config/         # 配置类
│   ├── src/main/resources/    # 配置文件
│   │   ├── application.yml     # 应用配置
│   │   └── mapper/             # MyBatis映射
│   └── pom.xml                # Maven配置
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── components/        # 通用组件
│   │   ├── views/             # 页面组件
│   │   ├── router/            # 路由配置
│   │   ├── store/             # 状态管理
│   │   └── utils/             # 工具函数
│   ├── tests/                 # 测试文件
│   └── package.json           # 依赖配置
├── database_init.sql          # 数据库初始化脚本
├── README.md                  # 项目说明
├── PRD.md                     # 需求规格说明书
├── SDS.md                     # 功能设计说明书
├── PROJECT_SUMMARY.md         # 项目开发总结
├── TEST_REPORT.md             # 测试报告
├── USER_TESTING_GUIDE.md      # 用户测试指南
└── problems_and_solutions.md  # 问题与解决方案
```

## 🧪 测试说明

### 自动化测试
项目包含全面的UI自动化测试，使用Playwright框架：

```bash
# 运行测试
cd frontend
npm run test

# 生成测试报告
npm run test:report
```

### 测试覆盖
- ✅ 登录功能测试
- ✅ 仪表盘功能测试
- ✅ 成员管理功能测试
- ✅ 活动管理功能测试
- ✅ 数据导出功能测试
- ✅ 响应式设计测试
- ✅ 权限控制测试

## 🔧 开发指南

### 后端开发
1. 使用MyBatis-Plus进行数据库操作
2. 遵循RESTful API设计规范
3. 实现统一的异常处理机制
4. 添加必要的日志记录

### 前端开发
1. 使用Vue2 + Element UI开发界面
2. 遵循组件化开发原则
3. 实现响应式设计
4. 添加必要的错误处理

### 数据库设计
- 使用逻辑外键，便于数据管理
- 添加必要的索引提高查询性能
- 遵循数据库设计规范

## 📊 性能指标

- **响应时间**: 单表1万条数据，列表查询≤800ms
- **并发支持**: 支持100+用户同时在线
- **数据容量**: 支持10万+成员数据
- **文件上传**: 支持最大10MB文件上传

## 🚀 部署说明

### 生产环境部署
1. **环境准备**
   ```bash
   # 安装JDK 21
   # 安装MySQL 8.0
   # 安装Node.js 16+
   ```

2. **数据库配置**
   ```bash
   # 创建数据库
   mysql -u root -p < database_init.sql
   ```

3. **后端部署**
   ```bash
   cd backend
   mvn clean package -DskipTests
   java -jar target/club-management-1.0.0.jar
   ```

4. **前端部署**
   ```bash
   cd frontend
   npm install
   npm run build
   # 将dist目录部署到Web服务器
   ```

### 环境变量配置
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=club_management
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400

# 文件上传
UPLOAD_PATH=./uploads
```

## 📚 文档说明

- **PRD.md**: 需求规格说明书，详细描述功能需求
- **SDS.md**: 功能设计说明书，系统架构和设计规范
- **PROJECT_SUMMARY.md**: 项目开发总结，技术亮点和成果
- **TEST_REPORT.md**: 测试报告，功能验证和测试结果
- **USER_TESTING_GUIDE.md**: 用户测试指南，详细测试步骤
- **problems_and_solutions.md**: 问题与解决方案，技术问题记录（包含数据库结构更新问题）

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request


## 📞 联系方式

如有问题或建议，请联系开发团队：
- 项目地址: https://github.com/Erd-omg/club_management
- 问题反馈: 请在GitHub Issues中提交

## 🙏 致谢

感谢所有为项目贡献代码和建议的开发者们！