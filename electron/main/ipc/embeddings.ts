import { ipcMain } from 'electron';
import { Embedder, embed } from './embedder';
import * as logging from './logging';

/**
 * Sets up IPC handlers for embeddings functionality
 */
export function setupEmbeddingsHandlers() {
  logging.info('Setting up embeddings handlers');
  
  // Get status of model files
  ipcMain.handle('embeddings:get-file-status', async () => {
    try {
      return Embedder.getFileStatus();
    } catch (error) {
      logging.error(`Failed to get file status: ${error}`);
      throw error;
    }
  });
  
  // Remove model files
  ipcMain.handle('embeddings:remove-model', async () => {
    try {
      Embedder.removeModel();
    } catch (error) {
      logging.error(`Failed to remove model: ${error}`);
      throw error;
    }
  });
  
  // Save model file
  ipcMain.handle('embeddings:save-model-file', async (_, fileName: string, filePath: string) => {
    try {
      Embedder.saveModelFile(fileName, filePath);
    } catch (error) {
      logging.error(`Failed to save model file: ${error}`);
      throw error;
    }
  });

  // Generate embeddings for text 
  ipcMain.handle('embeddings:embed', async (_event, texts: string[]) => {
    try {
      return await embed(texts);
    } catch (error) {
      logging.error(`Error generating embeddings: ${error}`);
      throw error;
    }
  });

  logging.info('Embedding handlers registered successfully');
} 