export interface IPromptDef {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  name?: string;
  systemMessage?: string;
  userMessage?: string;
  temperature?: number;
  maxTokens?: number;
  systemVariables?: string[];
  userVariables?: string[];
  models?: string[];
  pinedAt?: number;
}

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
  name?: string;
  timestamp?: number;
  reply?: string;
  reasoning?: string;
  prompt?: string;
  model?: string;
  temperature?: number;
  inputTokens?: number;
  outputTokens?: number;
  memo?: string;
  isActive?: boolean;
  citedFiles?: string;
  citedChunks?: string;
  bookmarkId?: string;
}

export interface IChatSession {
  id: string;
  title: string;
  messages: IChatMessage[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IChatFolder {
  id: string;
  name: string;
  chats: string[];
  createdAt: number;
  updatedAt: number;
  isNew?: boolean;
  model?: string;
  systemMessage?: string;
  temperature?: number;
  maxTokens?: number;
  maxCtxMessages?: number;
}

export interface IChat {
  id: string;
  title: string;
  messages: IChatMessage[];
  folderId?: string;
  createdAt: number;
  updatedAt: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  summary?: string;
  systemMessage?: string;
  maxCtxMessages?: number;
  prompt?: IPrompt | null;
  input?: string;
  stream?: boolean;
  canvasData?: string | null;
  context?: string;
}

export interface IStage {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  model?: string;
  systemMessage?: string;
  prompt?: IPrompt | null;
  input?: string;
  maxTokens?: number;
  maxCtxMessages?: number;
  temperature?: number;
  stream?: boolean;
}

export interface IPrompt {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
} 