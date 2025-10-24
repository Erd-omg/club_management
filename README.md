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
- 初始化脚本会自动创建表结构并插入测试数据
- 所有测试账号密码统一为：`password`

### 3. 启动后端服务
```bash
cd backend
mvn clean package -DskipTests
java -jar target/club-management-1.0.0.jar
```

**后端启动验证**：
- 访问: http://localhost:8081/api/auth/validate
- 应该返回401错误（未认证），说明服务正常
- 默认端口：8081

### 4. 启动前端服务
```bash
cd frontend
npm install
npm run serve
```

**前端启动验证**：
- 访问: http://localhost:5174
- 应该看到登录页面
- 默认端口：5174

### 5. 访问系统
- 前端地址: http://localhost:5174
- 后端API: http://localhost:8081/api
- 使用测试账号登录开始使用系统

## 👥 测试账号

| 角色 | 学号 | 密码 | 权限说明 |
|------|------|------|----------|
| 系统管理员 | admin | password | 全权限 |
| 社长 | 20211001 | 110001 | 全权限（密码为学号后6位） |
| 副社长 | 20211002 | 110002 | 管理权限（密码为学号后6位） |
| 部长 | 20211003 | 110003 | 部门权限（密码为学号后6位） |
| 副部长 | 20211004 | 110004 | 查看权限（密码为学号后6位） |
| 干事 | 20211005 | 110005 | 个人权限（密码为学号后6位） |
| 指导老师 | 20211006 | 110006 | 审批权限（密码为学号后6位） |

**密码规则**：
- 所有测试账号密码均为学号后6位
- 例如：学号20211001的密码为110001
- 管理员账号（admin）密码为：password
- 管理员可在"编辑社员信息"中重置任意用户密码为学号后6位

## 📁 项目结构

```
club-management/
├── backend/                    # 后端项目（Spring Boot）
│   ├── src/main/java/com/club/management/
│   │   ├── ClubManagementApplication.java    # 启动类
│   │   ├── common/                           # 通用类（Result、ErrorCode、JwtUtil）
│   │   ├── config/                           # 配置类（Web、Security、MyBatis-Plus）
│   │   ├── controller/                       # 控制器（9个）
│   │   ├── entity/                           # 实体类（9个）
│   │   ├── mapper/                           # Mapper接口（9个）
│   │   ├── service/                          # 服务层（9个）
│   │   └── dto/                              # 数据传输对象
│   ├── src/main/resources/
│   │   ├── application.yml                   # 应用配置
│   │   └── mapper/                           # MyBatis映射文件
│   ├── exports/                              # 导出文件目录
│   ├── uploads/                              # 上传文件目录
│   └── pom.xml                               # Maven配置
├── frontend/                   # 前端项目（Vue2）
│   ├── src/
│   │   ├── components/        # 通用组件（ResponsiveLayout、FileUpload等）
│   │   ├── views/             # 页面组件（登录、仪表盘、成员管理等）
│   │   ├── router/            # 路由配置
│   │   ├── store/             # 状态管理（Vuex）
│   │   ├── utils/             # 工具函数（API封装、请求拦截）
│   │   └── styles/            # 样式文件（Element UI变量、响应式样式）
│   ├── public/               # 静态资源
│   ├── vue.config.js         # Vue CLI配置
│   └── package.json          # 依赖配置
├── database_init.sql          # 数据库初始化脚本（包含表结构和测试数据）
└── README.md                  # 项目说明（本文件）
```

**重要说明**：
- 不包含编译产物：`backend/target/`、`frontend/dist/`、`frontend/node_modules/`
- 不包含IDE配置：`.idea/`、`.vscode/`、`*.iml`
- 不包含上传的文件：`backend/uploads/**/*`
- 不包含日志文件：`*.log`、`logs/`

## 🎯 核心功能模块

### 认证系统
- JWT token认证机制
- 多用户类型支持
- 登录/退出功能
- 权限控制

### 成员管理
- CRUD操作（增删改查）
- 批量导入
- 权限隔离（不同角色看到不同数据）
- 密码重置功能（管理员可重置为学号后6位）

### 部门管理
- 部门信息管理
- 成员统计
- 部门卡片展示

### 活动管理
- 活动创建与编辑
- 多签审批流程
- 活动参与管理
- 附件上传下载

### 数据导出
- Excel导出
- PDF导出
- 导出历史管理

### 统计图表
- 实时统计数据
- ECharts数据可视化
- 权限相关数据过滤

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
- ✅ 登录功能测试（正常登录、错误密码、空用户名/密码）
- ✅ 仪表盘功能测试（统计数据、图表显示、权限过滤）
- ✅ 成员管理功能测试（CRUD操作、批量导入、权限控制）
- ✅ 活动管理功能测试（创建、编辑、审批、删除）
- ✅ 活动参与管理测试（报名、取消报名、参与人员管理）
- ✅ 数据导出功能测试（Excel/PDF导出、下载）
- ✅ 响应式设计测试（桌面端、平板端、手机端）
- ✅ 权限控制测试（不同角色的权限验证）
- ✅ 个人中心测试（信息编辑、密码修改）

## 🔧 开发指南

### 后端开发
1. **数据库操作**：使用MyBatis-Plus进行数据库操作
2. **API设计**：遵循RESTful API设计规范
3. **异常处理**：实现统一的异常处理机制
4. **日志记录**：添加必要的日志记录
5. **代码规范**：遵循Java代码规范，使用Lombok简化代码
6. **单元测试**：为Service层编写单元测试
7. **接口文档**：及时更新API接口文档

### 前端开发
1. **框架使用**：使用Vue2 + Element UI开发界面
2. **组件化**：遵循组件化开发原则，提高代码复用性
3. **响应式**：实现响应式设计，支持多设备访问
4. **错误处理**：添加必要的错误处理和用户提示
5. **状态管理**：使用Vuex管理全局状态
6. **路由管理**：使用Vue Router实现前端路由
7. **API封装**：使用Axios封装HTTP请求

### 数据库设计
- **表结构**：使用逻辑外键，便于数据管理
- **索引优化**：添加必要的索引提高查询性能
- **设计规范**：遵循数据库设计规范（第三范式）
- **事务处理**：支持事务处理，确保数据一致性
- **字符编码**：使用UTF-8编码，支持中文存储
- **字段规范**：使用统一的命名规范和数据类型

### Git工作流
1. **分支管理**：主分支main用于生产环境，开发分支dev用于开发
2. **提交规范**：使用UTF-8编码，提交信息清晰明确
3. **代码审查**：提交前进行代码自查
4. **冲突处理**：及时解决合并冲突

## 📊 性能指标

### 浏览器兼容性
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ 移动端浏览器

### 系统要求
- **后端**: JDK 21+, MySQL 8.0+, Maven 3.6+
- **前端**: Node.js 16+, npm 7+
- **内存**: 建议4GB+（运行开发环境）
- **磁盘**: 建议10GB+可用空间

## 🚀 部署说明

### 开发环境部署（本地测试）

#### 完整部署流程
1. **克隆项目**
   ```bash
   git clone https://github.com/Erd-omg/club_management.git
   cd club_management
   ```

2. **初始化数据库**
   ```bash
   # 确保MySQL服务已启动
   mysql -u root -p < database_init.sql
   ```

3. **配置后端**
   ```bash
   cd backend
   # 修改 src/main/resources/application.yml 中的数据库连接信息
   # 注意：确保数据库用户名、密码、数据库名正确
   ```

4. **编译并启动后端**
   ```bash
   mvn clean package -DskipTests
   java -jar target/club-management-1.0.0.jar
   ```

5. **配置并启动前端**
   ```bash
   cd ../frontend
   npm install
   npm run serve
   ```

6. **访问系统**
   - 打开浏览器访问：http://localhost:5174
   - 使用测试账号登录

### 生产环境部署

#### 1. 环境准备
```bash
# 安装JDK 21
# 安装MySQL 8.0
# 安装Node.js 16+
# 安装Maven 3.6+
```

#### 2. 数据库配置
```bash
# 创建数据库
mysql -u root -p < database_init.sql

# 配置数据库用户权限（生产环境建议）
CREATE USER 'club_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON club_management.* TO 'club_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. 后端部署
```bash
cd backend
mvn clean package -DskipTests
java -jar target/club-management-1.0.0.jar
```

**生产环境配置**（建议使用环境变量或配置文件加密）：
- 修改 `application.yml` 中的数据库连接
- 配置 JWT_SECRET（使用强密码）
- 配置文件上传路径
- 配置日志输出路径

#### 4. 前端部署
```bash
cd frontend
npm install
npm run build
# 将dist目录部署到Nginx或其他Web服务器
```

**Nginx配置示例**：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/club_management/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
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
MAX_FILE_SIZE=10485760  # 10MB
```

## 🤝 贡献指南

### 开发流程
1. Fork项目到你的GitHub账号
2. 克隆你的Fork仓库到本地
3. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
4. 编写代码并添加必要的测试
5. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
6. 推送到你的Fork仓库 (`git push origin feature/AmazingFeature`)
7. 在原仓库创建Pull Request

### 代码规范
- 遵循统一的代码风格
- 添加必要的注释和文档
- 确保代码通过所有测试
- 提交前检查linter错误

### 测试要求
- 新功能需要添加相应的测试用例
- 确保不影响现有功能
- 通过所有自动化测试


## 🔍 常见问题 (FAQ)

### Q1: 如何重置数据库？
```bash
# 删除现有数据库
mysql -u root -p -e "DROP DATABASE IF EXISTS club_management;"

# 重新初始化
mysql -u root -p < database_init.sql
```

### Q2: 忘记密码怎么办？
使用admin账号登录后，在成员管理中重置用户密码。

### Q3: 后端启动失败？
检查以下几点：
- MySQL服务是否启动
- 数据库连接配置是否正确
- 端口8081是否被占用
- JDK版本是否为21

### Q4: 前端启动失败？
检查以下几点：
- Node.js版本是否为16+
- npm install是否成功
- 端口5174是否被占用
- 是否运行在frontend目录下

### Q5: 如何修改端口？
- **后端端口**：修改 `backend/src/main/resources/application.yml` 中的 `server.port`
- **前端端口**：修改 `frontend/vue.config.js` 中的 `devServer.port`

### Q6: 如何添加新功能？
1. 创建功能分支
2. 编写代码和测试
3. 提交Pull Request
4. 等待代码审查

### Q7: 如何获取最新代码？
```bash
git pull origin main
```

### Q8: 如何在Linux/Mac上运行？
```bash
# 后端
cd backend
mvn spring-boot:run

# 前端
cd frontend
npm run serve
```

## 🐛 故障排查

### 数据库连接问题
```bash
# 检查MySQL服务状态
mysql -u root -p -e "SELECT 1;"

# 检查数据库是否存在
mysql -u root -p -e "SHOW DATABASES LIKE 'club_management';"

# 检查表结构
mysql -u root -p club_management -e "SHOW TABLES;"
```

### 端口冲突问题
```bash
# Windows查看端口占用
netstat -ano | findstr :8081
netstat -ano | findstr :5174

# Linux/Mac查看端口占用
lsof -i :8081
lsof -i :5174
```

### 依赖安装问题
```bash
# 清除node_modules重新安装
cd frontend
rm -rf node_modules package-lock.json
npm install

# 清除Maven缓存
cd backend
mvn clean
```

### 权限问题
- 确保数据库用户有足够的权限
- 确保文件上传目录有写权限
- 确保日志目录有写权限

## 🌐 GitHub仓库

- **仓库地址**: https://github.com/Erd-omg/club_management
- **问题反馈**: 请在GitHub Issues中提交
- **功能建议**: 欢迎在Issues中讨论
- **Bug报告**: 请提供详细的复现步骤
- **Pull Request**: 欢迎提交代码改进

## 🔐 安全说明

### 生产环境安全建议
1. **数据库安全**
   - 使用强密码
   - 限制数据库用户权限
   - 定期备份数据
   - 使用SSL连接

2. **应用安全**
   - 修改默认JWT密钥
   - 使用HTTPS协议
   - 配置CORS策略
   - 定期更新依赖

3. **服务器安全**
   - 使用防火墙
   - 定期更新系统
   - 监控日志
   - 设置访问限制

## 📞 联系方式

如有问题或建议，请联系开发团队：
- 项目地址: https://github.com/Erd-omg/club_management
- 问题反馈: 请在GitHub Issues中提交
- 项目维护者: Erd-omg

## 🙏 致谢

感谢所有为项目贡献代码和建议的开发者们！
