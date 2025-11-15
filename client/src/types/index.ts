// 仕様書に基づく型定義

export interface Message {
  id: string;
  username: string;
  displayName: string;
  content: string;
  timestamp: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface User {
  id: string;
  username: string;
  joinedAt: number;
}

export interface JoinRequest {
  username: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface UserNotification {
  username: string;
}

export interface UserCountUpdate {
  count: number;
}

export interface ErrorResponse {
  message: string;
}
