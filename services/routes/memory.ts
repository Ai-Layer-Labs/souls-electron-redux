import express from "express";

export function memoryRouter() {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json({
      success: true,
      memories: [], // TODO: Implement memory functionality
    });
  });

  return router;
} 