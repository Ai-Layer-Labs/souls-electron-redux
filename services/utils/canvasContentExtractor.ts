import { CanvasContentType, CanvasContentData } from '../stores/useCanvasStore';

interface CalendarEvent {
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  calendar?: string;
  id?: string;
}

const DEFAULT_RESULT = {
  type: 'text' as CanvasContentType,
  data: { text: '' } as CanvasContentData,
  found: false
};

/**
 * Extracts code blocks with their language from markdown text
 */
function extractCodeBlock(text: string): { language: string; code: string } | null {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const matches = [...text.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    const [_, language, code] = matches[0];
    return { language: language || 'text', code: code.trim() };
  }
  
  return null;
}

/**
 * Extracts image URLs from markdown text
 */
function extractImageUrl(text: string): string | null {
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = text.match(imageRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * Looks for JSON blocks with specific content type information
 */
function extractJsonContent(text: string): { type: CanvasContentType; data: CanvasContentData; found: boolean } | null {
  try {
    // Find JSON blocks in the text
    const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})```/g;
    const matches = [...text.matchAll(jsonRegex)];
    
    for (const match of matches) {
      if (match[1]) {
        const jsonData = JSON.parse(match[1]);
        
        // Check if this is a canvas content directive
        if (jsonData.contentType && jsonData.data) {
          return {
            type: jsonData.contentType as CanvasContentType,
            data: jsonData.data as CanvasContentData,
            found: true
          };
        }
      }
    }
  } catch (error) {
    console.error('Error parsing JSON content', error);
  }
  
  return null;
}

/**
 * Extracts calendar events from text
 */
function extractCalendarEvents(text: string): CalendarEvent[] | null {
  // Check if this looks like a calendar response
  if (!text.includes('Found') || !text.includes('events')) {
    return null;
  }

  const events: CalendarEvent[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Look for event lines (they start with an emoji)
    if (line.match(/^[^\w\s]/)) {
      const event: CalendarEvent = { title: '', startTime: '', endTime: '' };
      
      // Extract title and time
      const titleMatch = line.match(/^(.*?)\s*-\s*(.*?)\s*\((.*?)\)/);
      if (titleMatch) {
        event.title = `${titleMatch[1].trim()} - ${titleMatch[2].trim()}`;
        const [startTime, endTime] = titleMatch[3].split(' - ');
        event.startTime = startTime.trim();
        event.endTime = endTime.trim();
      }

      // Look for location in next lines
      while (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (!nextLine) break;
        
        if (nextLine.startsWith('Location:')) {
          event.location = nextLine.replace('Location:', '').trim();
        } else if (nextLine.startsWith('Calendar:')) {
          event.calendar = nextLine.replace('Calendar:', '').trim();
        } else if (nextLine.startsWith('ID:')) {
          event.id = nextLine.replace('ID:', '').trim();
        }
        i++;
      }

      if (event.title && event.startTime && event.endTime) {
        events.push(event);
      }
    }
  }

  return events.length > 0 ? events : null;
}

/**
 * Main function to extract canvas content from a message
 */
export function extractCanvasContent(messageText: string): { type: CanvasContentType; data: CanvasContentData; found: boolean } {
  if (!messageText) {
    return DEFAULT_RESULT;
  }

  // First check for explicit JSON content definition
  const jsonContent = extractJsonContent(messageText);
  if (jsonContent) {
    return jsonContent;
  }

  // Check for code blocks
  const codeBlock = extractCodeBlock(messageText);
  if (codeBlock) {
    return {
      type: 'code',
      data: {
        language: codeBlock.language,
        code: codeBlock.code
      },
      found: true
    };
  }

  // Check for images
  const imageUrl = extractImageUrl(messageText);
  if (imageUrl) {
    return {
      type: 'image',
      data: {
        src: imageUrl
      },
      found: true
    };
  }

  // Default to text if no special content is found
  return {
    type: 'text',
    data: {
      text: messageText
    },
    found: false
  };
}

/**
 * Extracts content from AI responses and determines the appropriate content type
 * @param message The AI response message
 * @returns Object containing the content type and associated data
 */
export function extractContent(message: string): { 
  contentType: CanvasContentType; 
  data: CanvasContentData 
} {
  // Try to extract calendar events first
  const calendarEvents = extractCalendarEvents(message);
  if (calendarEvents) {
    return {
      contentType: 'calendar',
      data: { events: calendarEvents }
    };
  }

  // First, try to extract explicit JSON content definitions
  const jsonContentMatch = message.match(/```json([\s\S]*?)```/);
  if (jsonContentMatch) {
    try {
      const jsonContent = JSON.parse(jsonContentMatch[1]);
      if (jsonContent.contentType && jsonContent.data) {
        return {
          contentType: jsonContent.contentType as CanvasContentType,
          data: jsonContent.data as CanvasContentData
        };
      }
    } catch (error) {
      console.error('Error parsing JSON content:', error);
    }
  }

  // Then try to extract code blocks
  const codeBlockMatch = message.match(/```(\w*)\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    const [_, language, code] = codeBlockMatch;
    return {
      contentType: 'code',
      data: {
        language: language || 'text',
        code: code.trim()
      }
    };
  }

  // Then try to extract images
  const imageMatch = message.match(/!\[.*?\]\((.*?)\)/);
  if (imageMatch && imageMatch[1]) {
    return {
      contentType: 'image',
      data: {
        src: imageMatch[1]
      }
    };
  }

  // Then try to extract web content
  const urlMatch = message.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (urlMatch && urlMatch[1]) {
    return {
      contentType: 'web-content',
      data: { url: urlMatch[1] }
    };
  }

  // If no specific content is detected, return the text content
  return {
    contentType: 'text',
    data: { text: message }
  };
}

/**
 * Checks if a message contains content that should be displayed in the canvas
 * @param message The message to check
 * @returns True if the message contains displayable content
 */
export function hasDisplayableContent(message: string): boolean {
  // Check for code blocks, images, or explicit content definitions
  return (
    message.includes('```') || 
    message.match(/!\[.*?\]\(https?:\/\/[^\s)]+\)/) !== null ||
    message.match(/\[.*?\]\(https?:\/\/[^\s)]+\)/) !== null
  );
}
