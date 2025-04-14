import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { getDB } from "../database/index.js";
import { knowledgeBases } from "../database/schema.js";
import { eq } from "drizzle-orm";
import logger from "../utils/logger.js";

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

class KnowledgeBaseManager {
  private static instance: KnowledgeBaseManager;
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings: OpenAIEmbeddings | null = null;

  private constructor() {}

  public static getInstance(): KnowledgeBaseManager {
    if (!KnowledgeBaseManager.instance) {
      KnowledgeBaseManager.instance = new KnowledgeBaseManager();
    }
    return KnowledgeBaseManager.instance;
  }

  public async initialize() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error("OpenAI API key not found in environment variables");
      }

      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: apiKey,
      });

      this.vectorStore = await MemoryVectorStore.fromDocuments(
        [], // Start with empty documents
        this.embeddings
      );

      logger.info("Knowledge base manager initialized");
    } catch (error) {
      logger.error("Failed to initialize knowledge base manager:", error);
      throw error;
    }
  }

  public async addDocument(content: string, metadata: DocumentMetadata) {
    if (!this.vectorStore || !this.embeddings) {
      throw new Error("Knowledge base manager not initialized");
    }

    try {
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await textSplitter.createDocuments([content], [metadata]);
      await this.vectorStore.addDocuments(docs);

      // Store in database
      const db = getDB();
      await db.insert(knowledgeBases).values({
        id: metadata.id,
        name: metadata.name,
        description: metadata.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info(`Added document to knowledge base: ${metadata.name}`);
    } catch (error) {
      logger.error("Failed to add document to knowledge base:", error);
      throw error;
    }
  }

  public async similaritySearch(query: string, k: number = 4): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error("Knowledge base manager not initialized");
    }

    try {
      const results = await this.vectorStore.similaritySearch(query, k);
      return results;
    } catch (error) {
      logger.error("Failed to perform similarity search:", error);
      throw error;
    }
  }

  public async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    try {
      const db = getDB();
      const results = await db.select().from(knowledgeBases);
      return results.map(kb => ({
        id: kb.id,
        name: kb.name,
        description: kb.description || undefined,
        createdAt: new Date(kb.createdAt),
        updatedAt: new Date(kb.updatedAt),
      }));
    } catch (error) {
      logger.error("Failed to list knowledge bases:", error);
      throw error;
    }
  }

  public async deleteKnowledgeBase(id: string) {
    try {
      const db = getDB();
      await db.delete(knowledgeBases).where(eq(knowledgeBases.id, id));
      logger.info(`Deleted knowledge base: ${id}`);
    } catch (error) {
      logger.error("Failed to delete knowledge base:", error);
      throw error;
    }
  }
}

export default KnowledgeBaseManager; 