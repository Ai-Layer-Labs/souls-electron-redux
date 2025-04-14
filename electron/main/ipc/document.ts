import { BrowserWindow, ipcMain, dialog } from 'electron';
import * as logging from './logging';
import * as path from 'path';
import * as fs from 'fs/promises';
import { knowledgeCollections } from '../index';

// Define types for knowledge collections
interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  documents: Document[];
}

// Define types for documents
interface Document {
  id: string;
  name: string;
  path: string;
  content: string;
  dateAdded: Date;
}

/**
 * Sets up the document IPC handlers
 * @param mainWindow The main application window
 */
export function ipcDocumentHandler(mainWindow: BrowserWindow) {
  logging.info('Setting up document handlers');

  // Show open dialog for documents
  ipcMain.handle('document:show-open-dialog', async (_event, knowledgeBaseId?: string | number) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Documents', extensions: ['pdf', 'txt', 'md', 'doc', 'docx'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths;
      }
      
      return [];
    } catch (error) {
      logging.error(`Failed to show open dialog: ${error}`);
      throw error;
    }
  });

  // Process document and add to knowledge base
  ipcMain.handle('document:process', async (_event, filePath: string, collectionId?: string | number) => {
    try {
      logging.info(`Processing document: ${filePath} for collection: ${collectionId}`);
      
      // Read file content
      let content = '';
      try {
        // Simple text file reading - in a real app, you'd use different parsers for different file types
        content = await fs.readFile(filePath, 'utf-8');
      } catch (error) {
        logging.error(`Failed to read file: ${error}`);
        content = `Failed to read file: ${error}`;
      }
      
      // Get collection
      if (collectionId) {
        // Find the collection (direct access for simplicity)
        const collection = knowledgeCollections.find(c => c.id === collectionId.toString());
        
        if (collection) {
          const document: Document = {
            id: `doc-${Date.now()}`,
            name: path.basename(filePath),
            path: filePath,
            content,
            dateAdded: new Date()
          };
          
          collection.documents.push(document);
          logging.info(`Added document ${document.id} to collection ${collectionId}`);
          
          return { 
            success: true, 
            document,
            collectionId
          };
        } else {
          // If collection doesn't exist, create it
          const newCollection: KnowledgeCollection = {
            id: collectionId.toString(),
            name: `Collection ${collectionId}`,
            documents: []
          };
          
          const document: Document = {
            id: `doc-${Date.now()}`,
            name: path.basename(filePath),
            path: filePath,
            content,
            dateAdded: new Date()
          };
          
          newCollection.documents.push(document);
          knowledgeCollections.push(newCollection);
          
          logging.info(`Created new collection ${collectionId} and added document ${document.id}`);
          
          return { 
            success: true, 
            document,
            collectionId
          };
        }
      }
      
      // If no collection ID, just return the document
      return { 
        success: true, 
        document: {
          id: `doc-${Date.now()}`,
          name: path.basename(filePath),
          path: filePath,
          content,
          dateAdded: new Date()
        }
      };
    } catch (error) {
      logging.error(`Failed to process document: ${error}`);
      throw error;
    }
  });

  // Get documents for a knowledge base
  ipcMain.handle('knowledge-base:get-documents', async (_event, collectionId: string | number) => {
    try {
      logging.info(`Getting documents for collection: ${collectionId}`);
      const collection = knowledgeCollections.find(c => c.id === collectionId.toString());
      return collection ? collection.documents : [];
    } catch (error) {
      logging.error(`Failed to get documents: ${error}`);
      throw error;
    }
  });
  
  // Remove file
  ipcMain.handle('document:remove-file', async (_event, fileId: string) => {
    try {
      logging.info(`Removing file: ${fileId}`);
      let removed = false;
      
      // Look through all collections for the document
      for (const collection of knowledgeCollections) {
        const index = collection.documents.findIndex(doc => doc.id === fileId);
        if (index >= 0) {
          collection.documents.splice(index, 1);
          removed = true;
          break;
        }
      }
      
      return removed;
    } catch (error) {
      logging.error(`Failed to remove file: ${error}`);
      throw error;
    }
  });
} 