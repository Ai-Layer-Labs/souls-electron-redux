import { ipcMain } from 'electron';
import * as logging from './logging';
import * as path from 'path';

/**
 * Sets up the utility IPC handlers
 */
export function ipcUtilHandler() {
  logging.info('Setting up utility handlers');

  // Fill path to config
  ipcMain.handle('util:fillPathToConfig', async (_event, config: string) => {
    try {
      if (!config) return null;
      
      // If the config already has a valid path, return it
      if (path.isAbsolute(config)) {
        return config;
      }
      
      // Convert relative path to absolute path
      return path.resolve(process.cwd(), config);
    } catch (error) {
      logging.error(`Failed to fill path to config: ${error}`);
      return null;
    }
  });
}
