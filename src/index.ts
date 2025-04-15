/**
 * Writeathon MCP 服务器主入口
 */
import express from 'express';
import { config } from './config/env';
import apiRoutes from './routes/api-routes';
import { WriteathonMCPService } from './services/mcp-service';

// 创建Express应用
const app = express();

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api', apiRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 启动MCP服务
const mcpService = new WriteathonMCPService();
mcpService.start();

// 启动Express服务器
app.listen(config.server.port, () => {
  console.log(`服务器已启动: http://${config.server.host}:${config.server.port}`);
  console.log('使用 Ctrl+C 停止服务器');
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  mcpService.stop();
  process.exit(0);
});