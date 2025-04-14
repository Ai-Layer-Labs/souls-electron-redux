import { ChatCompletionMessage } from 'openai/resources/chat/completions';

export interface LLMProvider {
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMConfig {
  providers: LLMProvider[];
  defaultProvider: string;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
}

export class LLMService {
  private config: LLMConfig;
  private currentProvider: LLMProvider;

  constructor() {
    this.config = {
      providers: [],
      defaultProvider: 'venice'
    };
    this.currentProvider = this.getDefaultProvider();
  }

  private getDefaultProvider(): LLMProvider {
    return {
      name: 'venice',
      endpoint: import.meta.env.VITE_VENICE_ENDPOINT || 'https://api.venice.ai/v1',
      apiKey: import.meta.env.VITE_VENICE_API_KEY || '',
      model: 'gpt-3.5-turbo',
      maxTokens: 2000,
      temperature: 0.7
    };
  }

  public async initialize() {
    // Add default provider if no providers exist
    if (this.config.providers.length === 0) {
      this.config.providers.push(this.getDefaultProvider());
    }
  }

  public async chat(messages: ChatCompletionMessage[]): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.currentProvider.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.currentProvider.apiKey}`
        },
        body: JSON.stringify({
          model: this.currentProvider.model,
          messages,
          max_tokens: this.currentProvider.maxTokens,
          temperature: this.currentProvider.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        provider: this.currentProvider.name,
        model: this.currentProvider.model
      };
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  public addProvider(provider: LLMProvider) {
    this.config.providers.push(provider);
  }

  public setCurrentProvider(providerName: string) {
    const provider = this.config.providers.find(p => p.name === providerName);
    if (provider) {
      this.currentProvider = provider;
    } else {
      throw new Error(`Provider ${providerName} not found`);
    }
  }

  public getAvailableProviders(): string[] {
    return this.config.providers.map(p => p.name);
  }
}

// Export a singleton instance
export const llmService = new LLMService(); 