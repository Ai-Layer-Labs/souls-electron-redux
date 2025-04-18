import { MCPServerManager } from './index.js';
import { ENSUtility } from '../utils/ensUtility.js';
import logger from '../utils/logger.js';

/**
 * Register the ENS utility as a virtual MCP server
 * This function should be called after the MCPServerManager is initialized
 */
export function registerENSServer() {
  try {
    logger.info('Registering ENS utility as MCP server...');
    
    const serverManager = MCPServerManager.getInstance();
    const ensUtility = ENSUtility.getInstance();
    
    // Setting up ENS virtual server
    const serverName = 'ens-utilities';
    const serverConfig = {
      transport: "command" as const,
      enabled: true,
    };
    
    // We'll monkey-patch the MCPServerManager to handle our virtual server
    // This allows us to add our utility without modifying the MCPServerManager code directly
    
    // Store the original connectSingleServer method
    const originalConnectSingleServer = serverManager.connectSingleServer.bind(serverManager);
    
    // Replace it with our version that handles our special server name
    serverManager.connectSingleServer = async (name, config, env) => {
      if (name === serverName) {
        // For our special server name, return a successful result
        // The actual integration happens in the processQuery.ts file
        logger.info('ENS utility registered as high-priority MCP server');
        return { success: true, serverName };
      }
      
      // For all other server names, use the original method
      return originalConnectSingleServer(name, config, env);
    };
    
    // Now call connectSingleServer which will use our patched version
    serverManager.connectSingleServer(serverName, serverConfig, {})
      .then(result => {
        if (result.success) {
          logger.info('ENS utility registered successfully');
          
          // Now register with the tools list
          // We'll use a custom mechanism in processQuery.ts to handle our tools
          const toolsToRegister = ensUtility.getTools();
          logger.info(`Registered ENS tools: ${toolsToRegister.map(t => t.name).join(', ')}`);
        } else {
          logger.error(`Failed to register ENS utility: ${result.error}`);
        }
      })
      .catch(error => {
        logger.error('Error registering ENS utility:', error);
      });
    
  } catch (error) {
    logger.error('Error setting up ENS utility server:', error);
  }
} 