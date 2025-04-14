import type { ElectronHandler, EnvVars } from '../main/preload';

declare global {
  interface Window {
    electron: ElectronHandler;
    env: EnvVars;
    envVars: EnvVars;
  }
}

export {}; 