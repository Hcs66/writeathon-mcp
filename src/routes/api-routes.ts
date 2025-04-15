/**
 * API路由配置
 */
import { Router, Request, Response } from 'express';
import { WriteathonApiClient } from '../services/api-client';
import {
  CreateCardRequest,
  GetCardRequest,
  WritingPickRequest,
  RecentCardsRequest
} from '../types';

const router = Router();
const apiClient = new WriteathonApiClient();

// 获取用户信息
router.get('/me', async (req: Request, res: Response) => {
  try {
    const response = await apiClient.getMe();
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error('API路由 - 获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      errorCode: 1000
    });
  }
});

// 创建卡片
router.post('/cards', async (req: Request, res: Response) => {
  try {
    const cardData: CreateCardRequest = req.body;
    const response = await apiClient.createCard(cardData);
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error('API路由 - 创建卡片失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      errorCode: 1000
    });
  }
});

// 获取最近更新的卡片列表
router.get('/cards/recent', async (req: Request, res: Response) => {
  try {
    const params: RecentCardsRequest = req.query as any;
    const response = await apiClient.getRecentCards(params);
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error('API路由 - 获取最近卡片列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      errorCode: 1000
    });
  }
});

// 获取卡片
router.post('/cards/get', async (req: Request, res: Response) => {
  try {
    const cardRequest: GetCardRequest = req.body;
    const response = await apiClient.getCard(cardRequest);
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error('API路由 - 获取卡片失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      errorCode: 1000
    });
  }
});

// 写作拾贝
router.post('/writing-pick', async (req: Request, res: Response) => {
  try {    
    const pickRequest: WritingPickRequest = req.body;
    const response = await apiClient.getWritingPick(pickRequest);
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error('API路由 - 获取写作拾贝失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      errorCode: 1000
    });
  }
});

export default router;