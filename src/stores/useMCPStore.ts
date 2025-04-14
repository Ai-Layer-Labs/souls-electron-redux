import Debug from 'debug';
import { IMCPConfig, IMCPServer } from 'types/mcp';
import { create } from 'zustand';

const debug = Debug('souls:stores:useMCPStore');

export interface IMCPStore {
  isLoading: boolean;
  config: IMCPConfig;
  updateLoadingState: (isLoading: boolean) => void;
  loadConfig: (force?: boolean) => Promise<IMCPConfig>;
  addServer: (server: IMCPServer) => Promise<boolean>;
  updateServer: (server: IMCPServer) => Promise<boolean>;
  deleteServer: (key: string) => Promise<boolean>;
  activateServer: (
    key: string,
    command?: string,
    args?: string[],
    env?: Record<string, string>,
  ) => Promise<boolean>;
  deactivateServer: (key: string) => Promise<boolean>;
}

const useMCPStore = create<IMCPStore>((set, get) => ({
  isLoading: true,
  config: { servers: [] },
  updateLoadingState: (isLoading: boolean) => {
    set({ isLoading });
  },
  loadConfig: async (force?: boolean) => {
    if (!force && get().config.servers.length > 0) {
      return get().config;
    }
    const response = await window.electron.mcp.getConfig();
    if (!response.success) {
      debug('Failed to load config:', response.error);
      return get().config;
    }
    set({ config: response.config });
    return response.config;
  },
  addServer: async (server: IMCPServer) => {
    const response = await window.electron.mcp.addServer(server);
    if (!response.success) {
      debug('Failed to add server:', response.error);
      return false;
    }
    get().loadConfig(true);
    return response.result;
  },
  updateServer: async (server: IMCPServer) => {
    const response = await window.electron.mcp.updateServer(server);
    if (!response.success) {
      debug('Failed to update server:', response.error);
      return false;
    }
    get().loadConfig(true);
    return response.result;
  },
  deleteServer: async (key: string) => {
    const { servers } = get().config;
    const server = servers.find((svr) => svr.key === key);
    if (server) {
      const response = await get().deactivateServer(key);
      if (!response) {
        debug('Failed to deactivate server before deletion');
        return false;
      }
      const { servers } = get().config;
      const newConfig = { servers: servers.filter((svr) => svr.key !== key) };
      set({ config: newConfig });
      const putResponse = await window.electron.mcp.putConfig(newConfig);
      if (!putResponse.success) {
        debug('Failed to save config after deletion:', putResponse.error);
        return false;
      }
      return true;
    }
    return false;
  },
  activateServer: async (
    key: string,
    command?: string,
    args?: string[],
    env?: Record<string, string>,
  ) => {
    debug('Activating server:', {
      key,
      command,
      args,
      env,
    });
    const response = await window.electron.mcp.activate({
      key,
      command,
      args,
      env,
    });
    if (!response.success) {
      debug('Failed to activate server:', response.error);
      throw new Error(response.error || 'Failed to activate server');
    }
    await get().loadConfig(true);
    return true;
  },
  deactivateServer: async (key: string) => {
    const response = await window.electron.mcp.deactivate(key);
    if (!response.success) {
      debug('Failed to deactivate server:', response.error);
      throw new Error(response.error || 'Failed to deactivate server');
    }
    await get().loadConfig(true);
    return true;
  },
}));

export default useMCPStore;
