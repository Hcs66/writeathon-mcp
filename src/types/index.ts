/**
 * 类型定义文件
 */

// 用户信息接口
export interface User {
  id: string;
  username: string;
}

// 卡片接口
export interface Card {
  _id: string;
  title: string;
  content: string;
  created: Date;
  updated: Date;
}

export interface Attachment {
  type: "link" | "image";
  title: string;
  url: string;
  excerpt?: string;
  from?: string;
  content?: string;
}

export interface Space {
  id: string;
  title: string;
  description?: string;
  created: Date;
  updated: Date;
}

export interface SearchCardItem {
  title: string;
  content: string;
  parent?: string;
  attachments?: string;
}

// 写作拾贝项目接口
export interface WritingPickItem {
  id: string;
  title: string;
  content: string;
  created: Date;
  updated: Date;
  type: string;
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  action?: string;
  errorCode?: number;
  message?: string;
}

// 创建卡片请求接口
export interface CreateCardRequest {
  title?: string;
  content: string;
  space?: string;
  attachments?: Attachment[] | string;
}

export interface ExtendCardRequest {
  title?: string;
  content: string;
  parent: string;
  attachments?: Attachment[] | string;
}

export interface SearchCardsRequest {
  keyword: string;
  sortString?: string;
  space?: string;
  limit?: number;
}

// 获取卡片请求接口
export interface GetCardRequest {
  title?: string;
  id?: string;
}

// 写作拾贝请求接口
export interface WritingPickRequest {
  type?: 'all' | 'page' | 'card';
  limit?: number;
}

// 获取最近卡片请求接口
export interface RecentCardsRequest {
  exclude_date_title?: boolean;
  space?: string;
}
