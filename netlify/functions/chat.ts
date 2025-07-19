import { stream, type HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const { API_KEY } = process.env;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const SYSTEM_INSTRUCTION = `You are 'Stylo', a friendly and knowledgeable AI fashion advisor for an online store called 'Chic Threads'. 
Your goal is to provide helpful, concise, and stylish advice on clothing choices, pairings, and current trends. 
You should be enthusiastic and use emojis to make the conversation engaging and fun. 
Keep your responses relatively short and easy to read.
Strictly refuse to answer questions not related to fashion, style, or the products in this store.
Politely redirect any off-topic conversation back to fashion with a friendly tone.`;

const genAI = new GoogleGenAI({ apiKey: API_KEY });

const chatCache = new Map<string, Chat>();

function getChat(sessionId: string): Chat {
  if (chatCache.has(sessionId)) {
    return chatCache.get(sessionId)!;
  }

  const newChat = genAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  // Basic cache cleanup: remove after 1 hour of inactivity
  setTimeout(() => chatCache.delete(sessionId), 3600 * 1000); 

  chatCache.set(sessionId, newChat);
  return newChat;
}

async function* createResponseGenerator(resultStream: AsyncGenerator<GenerateContentResponse>) {
    const encoder = new TextEncoder();
    try {
        for await (const chunk of resultStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                const data = `data: ${JSON.stringify({ text: chunkText })}\n\n`;
                yield encoder.encode(data);
            }
        }
    } catch(e) {
        console.error("Stream error:", e);
        const errorData = `data: ${JSON.stringify({ error: "Stream failed" })}\n\n`;
        yield encoder.encode(errorData);
    }
}


const handler = stream(async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message, sessionId } = JSON.parse(event.body || '{}');

        if (!message || !sessionId) {
            return { statusCode: 400, body: 'Bad Request: Missing message or sessionId' };
        }

        const chat = getChat(sessionId);
        const result = await chat.sendMessageStream({ message });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
            body: createResponseGenerator(result),
        };

    } catch (error) {
        console.error('Error in chat function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get response from AI.' }),
        };
    }
});

export { handler };