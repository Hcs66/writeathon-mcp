# Writeathon MCP 服务器

这是一个基于MCP协议的Writeathon API服务器，提供了与Writeathon平台集成的MCP服务。

## 功能特点

- 基于Node.js和TypeScript开发
- 使用MCP协议（Model Context Protocol）提供服务
- 完整支持Writeathon API的所有功能
- 提供REST API接口和MCP服务接口

## 安装

```bash
# 先安装nodejs和npm

# 确保使用Node.js 20+以上版本，若同时安装多个版本，可先安装nvm
nvm use 20

# 安装依赖，请确保文件夹有读写权限
npm install
```

## 配置

1. 复制`.env.example`文件为`.env.prod`
2. 编辑`.env.prod`文件，填入你的Writeathon用户ID、集成Token（web→设置→集成）和MCP API密钥(自定义)

```
# API配置
API_BASE_URL=https://api.writeathon.cn
WRITEATHON_USER_ID=your_user_id_here
WRITEATHON_TOKEN=your_integration_token_here

# 服务器配置
PORT=3000
HOST=localhost

# MCP配置
MCP_API_KEY=your_mcp_api_key_here
```

## 运行

```bash
# 开发模式运行
npm run dev

# 或者构建后运行
npm run build
npm start
```

- 服务器将在`HOST:PORT`上运行。
- MCP服务将在`HOST:PORT+1`上运行。
- MCP SSE地址为`HOST:PORT+1/mcp/sse`。

## API接口

服务器提供以下REST API接口：

- `GET /api/me` - 获取用户信息
- `POST /api/cards` - 创建卡片
- `GET /api/cards/recent` - 获取最近更新的卡片列表
- `POST /api/cards/get` - 获取卡片
- `POST /api/writing-pick` - 写作拾贝

## MCP服务

服务器提供以下MCP服务：

- `me` - 获取用户信息
- `create_card` - 创建卡片
- `recent_cards` - 获取最近更新的卡片列表
- `get_card` - 获取卡片
- `writing_pick` - 写作拾贝

## 许可证

ISC