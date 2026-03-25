/**
 * Writeathon API客户端
 */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { config } from "../config/env";
import {
  ApiResponse,
  User,
  Card,
  Attachment,
  CreateCardRequest,
  ExtendCardRequest,
  GetCardRequest,
  SearchCardItem,
  SearchCardsRequest,
  Space,
  WritingPickRequest,
  WritingPickItem,
  RecentCardsRequest,
} from "../types";

export class WriteathonApiClient {
  private client: AxiosInstance;
  private userId: string = "";

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "x-writeathon-token": config.api.token,
      },
    });
    this.userId = config.api.userId;
  }

  private serializeAttachments(
    attachments: Attachment[] | string | undefined
  ): string | undefined {
    if (!attachments) return undefined;
    if (typeof attachments === "string") return attachments;
    return JSON.stringify(attachments);
  }

  /**
   * 获取用户信息
   */
  async getMe(): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get<ApiResponse<User>>("/v1/me");
      return response.data;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      return { success: false, message: "获取用户信息失败", errorCode: 1000 };
    }
  }

  /**
   * 创建卡片
   */
  async createCard(data: CreateCardRequest): Promise<ApiResponse<void>> {
    try {
      const payload: Record<string, unknown> = { ...data };
      const attachments = this.serializeAttachments(data.attachments);
      if (attachments !== undefined) payload.attachments = attachments;

      const response = await this.client.post<ApiResponse<void>>(
        `/v1/users/${this.userId}/cards`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("创建卡片失败:", error);
      return { success: false, message: "创建卡片失败", errorCode: 1000 };
    }
  }

  /**
   * 获取最近更新的卡片列表
   */
  async getRecentCards(
    params?: RecentCardsRequest
  ): Promise<ApiResponse<Card[]>> {
    try {
      const response = await this.client.get<ApiResponse<Card[]>>(
        `/v1/users/${this.userId}/cards/recent`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("获取最近卡片列表失败:", error);
      return {
        success: false,
        message: "获取最近卡片列表失败",
        errorCode: 1000,
      };
    }
  }

  /**
   * 获取卡片
   */
  async getCard(data: GetCardRequest): Promise<ApiResponse<Card>> {
    try {
      const response = await this.client.post<ApiResponse<Card>>(
        `/v1/users/${this.userId}/cards/get`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("获取卡片失败:", error);
      return { success: false, message: "获取卡片失败", errorCode: 1000 };
    }
  }

  /**
   * 扩展卡片
   */
  async extendCard(data: ExtendCardRequest): Promise<ApiResponse<void>> {
    try {
      const payload: Record<string, unknown> = { ...data };
      const attachments = this.serializeAttachments(data.attachments);
      if (attachments !== undefined) payload.attachments = attachments;

      const response = await this.client.post<ApiResponse<void>>(
        `/v1/users/${this.userId}/cards/extend`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("扩展卡片失败:", error);
      return { success: false, message: "扩展卡片失败", errorCode: 1000 };
    }
  }

  /**
   * 获取空间列表
   */
  async getSpaces(): Promise<ApiResponse<Space[]>> {
    try {
      const response = await this.client.get<ApiResponse<Space[]>>(
        `/v1/users/${this.userId}/spaces`
      );
      return response.data;
    } catch (error) {
      console.error("获取空间列表失败:", error);
      return { success: false, message: "获取空间列表失败", errorCode: 1000 };
    }
  }

  /**
   * 搜索卡片
   */
  async searchCards(
    data: SearchCardsRequest
  ): Promise<ApiResponse<SearchCardItem[]>> {
    try {
      const response = await this.client.post<ApiResponse<SearchCardItem[]>>(
        `/v1/users/${this.userId}/cards/search`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("搜索卡片失败:", error);
      return { success: false, message: "搜索卡片失败", errorCode: 1000 };
    }
  }

  /**
   * 写作拾贝
   */
  async getWritingPick(
    data: WritingPickRequest
  ): Promise<ApiResponse<WritingPickItem[]>> {
    try {      
      const response = await this.client.post<ApiResponse<WritingPickItem[]>>(
        `/v1/users/${this.userId}/writing-pick`,
        data
      );                  
      return response.data;
    } catch (error) {      
      console.error("获取写作拾贝失败:", error);
      return { success: false, message: "获取写作拾贝失败", errorCode: 1000 };
    }
  }
}
