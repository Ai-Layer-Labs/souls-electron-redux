import { ProviderType } from 'providers/types';
import { FontSize, ThemeType } from './appearance';

export type LanguageType = 'en' | 'zh' | 'system';

export interface TTSSettings {
  enabled: boolean;
  provider: 'venice' | 'openai';
  apiKey: string;
  voice: string;
  model: string;
  format: string;
  speed: number;
}

export interface ITTSSettings {
  enabled: boolean;
  provider: 'venice' | 'openai';
  voice: string;
  model: string;
  format: string;
  speed: number;
  apiKey?: string;
}

export interface IAPISettings {
  provider: ProviderType;
  base: string;
  key: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  secret?: string;
  deploymentId?: string;
  activeProvider?: string;
  providers?: { [key: string]: IAPISettings };
}

export interface ISettings {
  theme: ThemeType;
  language: LanguageType;
  fontSize: FontSize;
  api: IAPISettings;
  modelMapping: IModelMapping;
  toolStates: IToolStates;
  tts: ITTSSettings;
}

export interface IModelMapping {
  [key: string]: string;
}

export interface IToolStates {
  [key: string]: boolean;
}

export enum ProviderType {
  Venice = 'venice',
  OpenAI = 'openai',
  Anthropic = 'anthropic'
}
