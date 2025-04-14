import { BrowserWindow, ipcMain, screen } from 'electron';

/**
 * Sets up IPC handlers for managing popup windows
 * @param mainWindow The main application window
 * @param getPopupWindow Function to get the current popup window instance
 */
export function setupPopupHandlers(
  mainWindow: BrowserWindow,
  getPopupWindow: () => BrowserWindow | null
) {
  // Create or show popup window
  ipcMain.handle('popup:open', (_event, options: { url: string, width?: number, height?: number, modal?: boolean }) => {
    const { url, width = 500, height = 600, modal = false } = options;
    
    // Get existing popup or create a new one
    let popupWindow = getPopupWindow();
    
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.show();
      return true;
    } else {
      // Get position for the popup window
      const mainWindowPosition = mainWindow.getBounds();
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth } = primaryDisplay.workAreaSize;
      
      // Center the popup horizontally relative to the main window
      const x = Math.floor(mainWindowPosition.x + (mainWindowPosition.width - width) / 2);
      
      // Ensure the popup is visible on the screen
      const adjustedX = Math.max(0, Math.min(x, screenWidth - width));
      
      popupWindow = new BrowserWindow({
        width,
        height,
        x: adjustedX,
        y: mainWindowPosition.y + 100,
        parent: modal ? mainWindow : undefined,
        modal,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false
        }
      });
      
      // Load the popup content
      popupWindow.loadURL(url);
      
      // Show when ready
      popupWindow.once('ready-to-show', () => {
        popupWindow?.show();
      });
      
      popupWindow.on('closed', () => {
        mainWindow.webContents.send('popup:closed');
      });
      
      return true;
    }
  });
  
  // Close popup window
  ipcMain.handle('popup:close', () => {
    const popupWindow = getPopupWindow();
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.close();
      return true;
    }
    return false;
  });
} 