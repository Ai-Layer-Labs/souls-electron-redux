import { z } from "zod";
import logger from "./logger";

// Define the expected response schema
const ResponseContentSchema = z.union([
  z.object({
    type: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("image"),
    data: z.unknown(),
    mimeType: z.unknown(),
  }),
  z.object({
    type: z.literal("audio"),
    data: z.unknown(),
    mimeType: z.unknown(),
  }),
  z.object({
    type: z.literal("resource"),
    resource: z.union([
      z.object({
        type: z.string(),
        data: z.unknown(),
      }),
      z.object({
        type: z.string(),
        url: z.string(),
      }),
    ]),
  }),
]);

export type ResponseContent = z.infer<typeof ResponseContentSchema>;

/**
 * Adapts a tool response to the expected format
 * @param response The raw tool response
 * @returns A properly formatted response object
 */
export function adaptToolResponse(response: unknown): ResponseContent[] {
  // If response is a string, wrap it as text content
  if (typeof response === "string") {
    if (response.includes("imageUrl")) {
      return [{
        type: "image",
        data: response["imageUrl"],
        mimeType: "image/png",
      }];
    } else {
      return [{
        type: "text",
        text: response,
      }];  
    }
  }

  logger.info("toolstring unable to parse:", response);
  // If response is an object that already matches our schema, return it as is
  try {
    const parsed = ResponseContentSchema.parse(response);
    return [parsed];
  } catch {
    // If parsing fails, convert to string and wrap as text
    return [{
      type: "text",
      text: JSON.stringify(response),
    }];
  }
} 