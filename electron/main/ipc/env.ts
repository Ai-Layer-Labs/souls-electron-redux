import { ipcMain, app } from 'electron';
import * as path from 'path';
import * as logging from './logging';
import { port } from '../service';

/**
 * Sets up the environment IPC handlers
 */
export function ipcEnvHandler() {
  logging.info('Setting up environment handlers');

  // Hotkey map
  ipcMain.handle("env:getHotkeyMap", async () => {
    return {
      submit: "CommandOrControl+Enter",
      hide: "CommandOrControl+H",
      show: "CommandOrControl+J",
      editLastMessage: "ArrowUp",
      newChat: "CommandOrControl+N",
    };
  });

  // Get platform
  ipcMain.handle('env:getPlatform', () => {
    try {
      return process.platform;
    } catch (error) {
      logging.error(`Failed to get platform: ${error}`);
      return '';
    }
  });

  // Get resources path
  ipcMain.handle('env:getResourcesPath', (_event, p: string) => {
    try {
      return app.isPackaged ? path.join(process.resourcesPath, p) : p;
    } catch (error) {
      logging.error(`Failed to get resources path: ${error}`);
      return '';
    }
  });

  // Get port
  ipcMain.handle('env:port', async () => {
    try {
      // Return the port from the service
      return await port;
    } catch (error) {
      logging.error(`Failed to get port: ${error}`);
      return 3000; // Fallback port
    }
  });
}

