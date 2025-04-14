import { ProviderType } from './types';

export const getProvider = (type: ProviderType) => {
  // Implementation
  return {
    chat: {
      temperature: {
        default: 0.7
      },
      apiSchema: ['base', 'key', 'model', 'secret', 'deploymentId']
    }
  };
};

export const getChatModel = (provider: ProviderType, modelName: string) => {
  // Implementation
  return {
    inputPrice: 0,
    outputPrice: 0
  };
}; 