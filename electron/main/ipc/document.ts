import { BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';
import * as KnowledgeStore from '../knowledge-store';

// Define type for a document
// interface Document {
//   id: string;
//   name: string;
//   path: string;
//   content: string;
//   dateAdded: Date;
// }

export function setupDocumentHandlers() {
  console.log('Setting up document handlers');

  // Show open dialog to select documents
  ipcMain.handle('document:show-open-dialog', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) {
        throw new Error('No window associated with event sender');
      }

      const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Text Files', extensions: ['txt', 'md', 'pdf', 'doc', 'docx'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (canceled || filePaths.length === 0) {
        return { canceled: true, files: [] };
      }

      return {
        canceled: false,
        files: filePaths.map(filePath => ({
          path: filePath,
          name: path.basename(filePath)
        }))
      };
    } catch (error: unknown) {
      console.error('Error showing open dialog:', error);
      return { canceled: true, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Process documents and add to knowledge base collection
  ipcMain.handle('document:process', async (_event, files, collectionId) => {
    console.log(`Processing ${files.length} document(s) for collection ${collectionId}`);
    
    try {
      const results = [];
      
      for (const file of files) {
        // Read file content
        const content = await fs.readFile(file.path, 'utf-8');
        
        // Create document object
        const document: KnowledgeStore.Document = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          path: file.path,
          content: content,
          dateAdded: new Date()
        };
        
        // Add document to collection
        const success = KnowledgeStore.addDocumentToCollection(collectionId, document);
        
        if (success) {
          results.push({
            name: file.name,
            id: document.id,
            success: true
          });
          
          console.log(`Added document ${document.id} to collection ${collectionId}`);
        }
      }
      
      return {
        success: true,
        processedFiles: results
      };
    } catch (error: unknown) {
      console.error('Error processing documents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // Get documents for a collection
  ipcMain.handle('knowledge-base:get-documents', async (_event, collectionId: string | number) => {
    try {
      console.log(`Getting documents for collection: ${collectionId}`);
      const collection = KnowledgeStore.getCollection(collectionId.toString());
      return collection ? collection.documents : [];
    } catch (error) {
      console.error(`Failed to get documents: ${error}`);
      throw error;
    }
  });

  // Remove a document
  ipcMain.handle('document:remove-file', async (_event, fileId: string) => {
    try {
      console.log(`Removing file: ${fileId}`);
      const removed = KnowledgeStore.removeDocumentFromCollection(fileId);
      return removed;
    } catch (error) {
      console.error(`Failed to remove file: ${error}`);
      throw error;
    }
  });
} 