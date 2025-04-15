/**
 * 环境配置文件
 */
import dotenv from "dotenv";

// 加载.env文件
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

export const config = {
  // API配置
  api: {
    baseUrl: process.env.API_BASE_URL || "https://api.writeathon.cn",
    token: process.env.WRITEATHON_TOKEN || "",
    userId: process.env.WRITEATHON_USER_ID || "",
  },
  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    host: process.env.HOST || "localhost",
  },
  // MCP配置
  mcp: {
    // MCP相关配置
    apiKey: process.env.MCP_API_KEY || "",
  },
};
