import { ethers } from 'ethers';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import logger from './logger.js';

// Type declaration for server capabilities
interface ServerCapabilities {
  description: string;
  icon: string;
  [key: string]: unknown;
}

// ENS utility class that serves as a virtual MCP server for ENS name resolution
export class ENSUtility {
  private static instance: ENSUtility;
  private provider: ethers.providers.Provider;

  private constructor() {
    // Set up the provider with Infura (public gateway)
    this.provider = new ethers.providers.InfuraProvider('mainnet');
    logger.info("ENS Utility: Initialized with Infura provider");
  }

  public static getInstance(): ENSUtility {
    if (!ENSUtility.instance) {
      ENSUtility.instance = new ENSUtility();
    }
    return ENSUtility.instance;
  }

  // Create a tool list that will be registered with the MCP server manager
  public getTools(): Tool[] {
    return [
      {
        name: 'resolve_ens',
        description: 'Resolve an ENS name to an Ethereum address',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The ENS name to resolve (e.g. vitalik.eth)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'lookup_address',
        description: 'Look up the primary ENS name for an Ethereum address',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'The Ethereum address to look up (e.g. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)',
            },
          },
          required: ['address'],
        },
      },
    ];
  }

  // Get capabilities for the virtual MCP server
  public getCapabilities(): ServerCapabilities {
    return {
      description: 'ENS name resolution utility',
      icon: '',
    };
  }

  // Create a virtual MCP client that provides ENS tools
  public createClient(): Client {
    const tools = this.getTools();
    const capabilities = this.getCapabilities();

    return {
      async listTools(): Promise<{ tools: Tool[] }> {
        return { tools };
      },

      async getServerCapabilities(): Promise<Record<string, unknown>> {
        return capabilities;
      },

      async callTool(
        tool: { name: string; arguments: Record<string, unknown> },
        _metadata?: Record<string, unknown>,
        _options?: { signal?: AbortSignal; timeout?: number }
      ): Promise<Record<string, unknown>> {
        const ensUtility = ENSUtility.getInstance();

        try {
          switch (tool.name) {
            case 'resolve_ens':
              return await ensUtility.resolveENS(tool.arguments as { name: string });
            case 'lookup_address':
              return await ensUtility.lookupAddress(tool.arguments as { address: string });
            default:
              throw new Error(`Unknown tool: ${tool.name}`);
          }
        } catch (error) {
          logger.error(`Error in ENS tool ${tool.name}:`, error);
          throw error;
        }
      },

      async close(): Promise<void> {
        // No resources to clean up
      }
    };
  }

  // Resolve an ENS name to an Ethereum address
  public async resolveENS(args: { name: string }): Promise<Record<string, unknown>> {
    try {
      const address = await this.provider.resolveName(args.name);
      
      if (!address) {
        return {
          error: true,
          message: `Could not resolve ENS name: ${args.name}`,
        };
      }
      
      return {
        address,
      };
    } catch (error) {
      logger.error(`Error resolving ENS name ${args.name}:`, error);
      return {
        error: true,
        message: `Error resolving ENS name: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // Look up the primary ENS name for an Ethereum address
  public async lookupAddress(args: { address: string }): Promise<Record<string, unknown>> {
    try {
      const ensName = await this.provider.lookupAddress(args.address);
      
      if (!ensName) {
        return {
          error: false,
          message: `No ENS name found for address: ${args.address}`,
          name: null,
        };
      }
      
      return {
        name: ensName,
      };
    } catch (error) {
      logger.error(`Error looking up address ${args.address}:`, error);
      return {
        error: true,
        message: `Error looking up address: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
} 