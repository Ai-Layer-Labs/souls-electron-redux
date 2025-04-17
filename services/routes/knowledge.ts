import express from "express";
import KnowledgeBaseManager from "../knowledgeBase/index.js";

export function knowledgeRouter() {
  const router = express.Router();

  router.get("/", (req, res) => {
    try {
      const knowledgeBases = KnowledgeBaseManager.getInstance().listKnowledgeBases();
      res.json({
        success: true,
        knowledgeBases: knowledgeBases,
      });
    } catch (error) {
      res.json({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  });

  return router;
}
