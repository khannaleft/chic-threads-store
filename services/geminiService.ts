
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chat: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const SYSTEM_INSTRUCTION = `You are 'Stylo', a friendly and knowledgeable AI fashion advisor for an online store called 'Chic Threads'. 
Your goal is to provide helpful, concise, and stylish advice on clothing choices, pairings, and current trends. 
You should be enthusiastic and use emojis to make the conversation engaging and fun. 
Keep your responses relatively short and easy to read.
Strictly refuse to answer questions not related to fashion, style, or the products in this store.
Politely redirect any off-topic conversation back to fashion with a friendly tone.`;

export function isApiKeySet(): boolean {
    return !!process.env.API_KEY;
}

function initializeChat() {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set. Gemini Service cannot be initialized.");
        return;
    }
    if (!genAI) {
        genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    chat = genAI.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });
}

export async function streamMessage(message: string): Promise<AsyncGenerator<GenerateContentResponse>> {
    if (!isApiKeySet()) {
        throw new Error("API Key is not configured. Cannot connect to Style Advisor.");
    }
    
    if (!chat) {
        initializeChat();
    }
    
    if (!chat) {
        throw new Error("Chat could not be initialized.");
    }

    const result = await chat.sendMessageStream({ message });
    return result;
}
