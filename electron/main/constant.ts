import { app } from "electron"
import envPaths from "env-paths"
import os from "os"
import path from "path"

export const envPath = envPaths(app.getName(), {suffix: ""})
export const configDir = envPath.config
export const cacheDir = envPath.cache
export const homeDir = os.homedir()
export const appDir = path.join(homeDir, ".souls")
export const scriptsDir = path.join(appDir, "scripts")

export const binDirList = [
  path.join(process.resourcesPath, "node"),
  path.join(process.resourcesPath, "uv"),
  path.join(process.resourcesPath, "python"),
]

export const darwinPathList = [
  "/opt/homebrew/bin",
  "/usr/local/bin",
  "/usr/bin",
]

export const DEF_MCP_SERVER_CONFIG = {
  "mcpServers": {
    "thirdweb-mcp": {
      "command": "uvx",
      "args": [
        "thirdweb-mcp"
      ],
      "env": {
        "THIRDWEB_SECRET_KEY": "your thirdweb secret key from dashboard",
        "THIRDWEB_ENGINE_URL": "(OPTIONAL) your engine url",
        "THIRDWEB_ENGINE_AUTH_JWT": "(OPTIONAL) your engine auth jwt",
        "THIRDWEB_ENGINE_BACKEND_WALLET_ADDRESS": "(OPTIONAL) your engine backend wallet address"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/johnnyclem/Desktop"
      ],
    },
    "mcpollinations": {
      "command": "npx",
      "args": [
        "-y",
        "@pinkpixel/mcpollinations"
      ]
    },
    "fetch": {
      "command": "uvx",
      "args": [
        "mcp-server-fetch"
      ]
    },
    "Futureverse": {
      "url": "https://mcp.sou.ls/futureverse/sse",
      "transport": "sse"
    }, 
    "Heurist Mesh": {
      "url": "https://mcp.sou.ls/heurist-mesh/sse",
      "transport": "sse"
    },
    "edgeone-pages-mcp-server": {
      "command": "npx",
      "args": [
        "edgeone-pages-mcp"
      ],
    },
    "coincap": {
      "command": "npx",
      "args": [
        "coincap-mcp"
      ],
    }
  }
}

/*
    "mcpollinations": {
      "command": "npx",
      "args": [
        "-y",
        "@pinkpixel/mcpollinations"
      ],
      "enabled": true
    },
    "fetch": {
      "command": "uvx",
      "args": [
        "mcp-server-fetch"
      ],
      "enabled": true
    },
    "Futureverse": {
      "url": "https://mcp.sou.ls/futureverse/sse",
      "enabled": false,
      "transport": "sse",
      "disabled": true
    },
    "browserbasehq": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "install",
        "@browserbasehq/mcp-browserbase"
      ],
      "env": {
        "browserbaseApiKey": "bb_live_Qgpv2yCZuERR7t0XIkvjjgFt9pw",
        "browserbaseProjectId": "7b3cf4d6-38aa-48f1-b083-9f7cd29a00cd"
      },
      "enabled": false,
      "disabled": true
    },
    "mcp-browserbase": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@browserbasehq/mcp-browserbase",
        "--config",
        "{\"browserbaseApiKey\":\"bb_live_Qgpv2yCZuERR7t0XIkvjjgFt9pw\",\"browserbaseProjectId\":\"7b3cf4d6-38aa-48f1-b083-9f7cd29a00cd\"}"
      ],
      "enabled": true,
      "disabled": false
    },
    "edgeone-pages-mcp-server": {
      "command": "npx",
      "args": [
        "edgeone-pages-mcp"
      ],
      "enabled": true
    },
    "thirdweb-mcp": {
      "command": "thirdweb-mcp",
      "args": [],
      "env": {
        "THIRDWEB_SECRET_KEY": "your thirdweb secret key from dashboard",
        "THIRDWEB_ENGINE_URL": "(OPTIONAL) your engine url",
        "THIRDWEB_ENGINE_AUTH_JWT": "(OPTIONAL) your engine auth jwt",
        "THIRDWEB_ENGINE_BACKEND_WALLET_ADDRESS": "(OPTIONAL) your engine backend wallet address"
      },
      "enabled": false,
      "disabled": true
    },
    "coincap": {
      "command": "npx",
      "args": [
        "coincap-mcp"
      ],
      "enabled": true
    },
    "alchemy": {
      "command": "node",
      "args": [
        "/Users/johnnyclem/Desktop/MCP/alchemy-sdk-mcp/dist/index.js"
      ],
      "env": {
        "ALCHEMY_API_KEY": "alcht_una89H7CFnNGJzGJALTaTzWTUicqz8"
      },
      "enabled": false
    }
  }
}
*/