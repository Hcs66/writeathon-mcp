# Writeathon MCP 服务器

这是一个基于MCP协议的Writeathon API服务器，提供了与Writeathon平台集成的MCP服务。

## 功能特点

- 基于Node.js和TypeScript开发
- 使用MCP协议（Model Context Protocol）提供服务
- 提供REST API接口和MCP服务接口

## 安装

```bash
# 1. 克隆仓库
git clone https://github.com/Hcs66/writeathon-mcp.git
cd writeathon-mcp

# 2. 安装nodejs
# 确保使用Node.js 20+以上版本，若同时存在多个版本，可先安装nvm并切换

# 安装依赖，确保文件夹有读写权限
npm install
```

## 配置

1. 开发模式：复制`.env.example`文件为`.env.dev`
2. 生产模式：复制`.env.example`文件为`.env.prod`
3. 编辑对应的环境文件，填入你的Writeathon用户ID、集成Token（web→设置→集成）

```
# API配置
API_BASE_URL=https://api.writeathon.cn
WRITEATHON_USER_ID=your_user_id_here
WRITEATHON_TOKEN=your_integration_token_here

# 服务器配置
PORT=3000
HOST=localhost
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
- MCP Streamable HTTP地址为`HOST:PORT+1/mcp`。
- MCP健康检查地址为`HOST:PORT+1/mcp/health`。

## 在Claude/Trae等平台使用
通过复制`mcp.json`内容手动创建MCP

其中`HOST`和`PORT`为.env配置文件中的HOST和PORT+1，如HOST=localhost,PORT=3000，则url为`http://localhost:3001/mcp`

```json
{
  "mcpServers": {
    "writeathon": {
      "type": "streamable-http",
      "url": "http://HOST:PORT/mcp",
      "note": "For Streamable HTTP connections, add this URL directly in your MCP Client"
    }
  }
}
```

## API接口

服务器提供以下REST API接口：

- `GET /api/me` - 获取用户信息
- `POST /api/cards` - 创建卡片（支持space、attachments）
- `POST /api/cards/extend` - 扩展卡片（支持attachments）
- `GET /api/cards/recent` - 获取最近更新的卡片列表（支持space、exclude_date_title）
- `POST /api/cards/get` - 获取卡片
- `POST /api/cards/search` - 搜索卡片（支持space、sortString、limit）
- `GET /api/spaces` - 获取空间列表
- `POST /api/writing-pick` - 写作拾贝

## MCP服务

服务器提供以下MCP能力：

- Resources
  - `user://me` - 获取用户信息
  - `recent-cards://list?exclude_date_title={exclude_date_title}&space={space}` - 最近卡片列表
  - `cards://{id}` - 获取卡片
  - `writing-pick://{type}?limit={limit}` - 写作拾贝
  - `spaces://list` - 空间列表
- Tools
  - `create-card` - 创建卡片（支持space、attachments）
  - `extend-card` - 扩展卡片（支持attachments）
  - `get-card` - 获取卡片
  - `get-recent-cards` - 获取最近更新的卡片列表（支持space、exclude_date_title）
  - `search-cards` - 搜索卡片
  - `list-spaces` - 获取空间列表
  - `get-writing-pick` - 写作拾贝
- Prompts
  - `create-card-prompt` - 根据内容创建卡片
  - `writing-pick-prompt` - 获取写作拾贝

## 许可证

ISC
