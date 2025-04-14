export interface IMCPServer {
  key: string;
  type: 'hosted' | 'local';
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
  isActive?: boolean;
  cwd?: string;
}

export interface IMCPConfig {
  servers: IMCPServer[];
}

export type MCPEnvType = 'string' | 'number' | 'boolean';
export type MCPArgType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export type MCPArgParameter = { [key: string]: MCPArgType };
export type MCPEnvParameter = { [key: string]: MCPEnvType };

export interface IMCPServerParameter {
  name: string;
  type: MCPArgType | MCPEnvType;
  description: string;
}
