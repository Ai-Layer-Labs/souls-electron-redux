import express from "express";
import { MCPServerManager } from "../mcpServer/index.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ServerError extends Error {
  message: string;
}

export function toolsRouter() {
  const router = express.Router();

  router.get("/", (req, res) => {
    try {
      const tools = MCPServerManager.getInstance().getToolInfos();
      res.json({
        success: true,
        tools: tools,
      });
    } catch (error) {
      const serverError = error as ServerError;
      res.json({
        success: false,
        message: serverError.message,
      });
    }
  });

  router.post("/restore", async (req, res) => {
    try {
      // Read default servers configuration
      const defaultConfigPath = path.join(__dirname, "../../../src/assets/default-servers.json");
      const defaultConfig = JSON.parse(await fs.readFile(defaultConfigPath, "utf-8"));

      // Update config file
      await fs.writeFile(MCPServerManager.getInstance().configPath, JSON.stringify(defaultConfig, null, 2));

      // Sync servers with new config
      const manager = MCPServerManager.getInstance();
      const errors = await manager.syncServersWithConfig();

      // Handle any sync errors
      if (errors.length > 0) {
        res.json({
          success: false,
          message: "Failed to sync some servers",
          errors: errors
        });
        return;
      }

      // Get updated tools
      const tools = manager.getToolInfos();

      res.json({
        success: true,
        tools: tools,
      });
    } catch (error) {
      const serverError = error as ServerError;
      res.json({
        success: false,
        message: serverError.message,
      });
    }
  });

  return router;
}
