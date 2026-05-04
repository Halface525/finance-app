# 个人财务记账系统

一个基于 React + Node.js + SQLite 的个人财务管理应用。

## 功能特性

- 📊 **仪表盘** - 查看本月收支概览和最近记录
- 📝 **收支记录** - 添加、编辑、删除收支记录，支持分页和筛选
- 🏷️ **分类管理** - 创建自定义收支分类，支持颜色标识
- 📈 **统计报表** - 可视化图表展示收支分布和趋势

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS 样式
- Chart.js + react-chartjs-2 图表
- Lucide React 图标

### 后端
- Node.js + Express
- TypeScript
- SQLite 数据库

## 项目结构

```
finance-app/
├── client/           # 前端代码
│   ├── src/
│   │   ├── api/      # API 请求封装
│   │   ├── components/ # 公共组件
│   │   ├── pages/    # 页面组件
│   │   ├── types/    # 类型定义
│   │   └── ...
│   └── package.json
├── server/           # 后端代码
│   ├── src/
│   │   ├── database/ # 数据库配置
│   │   ├── routes/   # API 路由
│   │   ├── types/    # 类型定义
│   │   └── server.ts # 服务入口
│   └── package.json
└── README.md
```

## 快速开始

### 前置条件

- Node.js >= 18.x
- npm 或 yarn

### 安装依赖

```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

### 启动服务

```bash
# 启动后端服务（端口 3001）
cd server
npm run dev

# 启动前端开发服务器（端口 5173）
cd client
npm run dev
```

### 访问应用

打开浏览器访问 http://localhost:5173

## API 接口

### 分类管理
- `GET /api/categories` - 获取所有分类
- `POST /api/categories` - 创建新分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 收支记录
- `GET /api/transactions` - 获取交易记录列表
- `GET /api/transactions/:id` - 获取单个交易记录
- `POST /api/transactions` - 创建新交易记录
- `PUT /api/transactions/:id` - 更新交易记录
- `DELETE /api/transactions/:id` - 删除交易记录

### 统计报表
- `GET /api/stats/monthly/:year/:month` - 获取月度统计
- `GET /api/stats/categories/:year/:month/:type` - 获取分类统计

## 默认分类

系统初始化时会创建以下默认分类：

**收入分类**
- 工资
- 奖金
- 投资收益
- 其他收入

**支出分类**
- 餐饮
- 交通
- 购物
- 娱乐
- 医疗
- 教育
- 住房
- 其他支出

## License

MIT
