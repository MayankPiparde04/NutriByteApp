// src/lib/chatStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredMessage = {
  id: string;
  text?: string;
  imageUri?: string;
  fromAI: boolean;
  timestamp: number;
};

export type StoredChat = {
  messages: StoredMessage[];
  title?: string;
  lastUpdated?: number;
};

const STORAGE_KEY = "chat_history";

/** internal helper to read full store */
async function readStore(): Promise<Record<string, StoredChat>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

/** Append a message, trimming the list to maxMessages */
export async function appendMessageToChat(
  chatId: string,
  message: StoredMessage,
  maxMessages = 500
): Promise<void> {
  const store = await readStore();
  const chat = store[chatId] ?? { messages: [], title: undefined, lastUpdated: 0 };
  chat.messages = [...chat.messages, message].slice(-maxMessages);
  chat.lastUpdated = message.timestamp;
  store[chatId] = chat;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/** Get all messages for a chat */
export async function getChatMessages(chatId: string): Promise<StoredMessage[]> {
  const store = await readStore();
  return store[chatId]?.messages ?? [];
}

/** Return an array of chat summaries sorted by lastUpdated desc */
export const getAllChatSummaries = async () => {
  try {
    const storedData = await AsyncStorage.getItem("chat_summaries");
    if (!storedData) return [];

    let summaries = JSON.parse(storedData);

    // Add firstMessage & firstMessageTime for each chat
    const updatedSummaries = await Promise.all(
      summaries.map(async (summary: any) => {
        try {
          const chatHistoryRaw = await AsyncStorage.getItem(`chat_${summary.chatId}`);
          if (chatHistoryRaw) {
            const chatMessages = JSON.parse(chatHistoryRaw);

            if (chatMessages.length > 0) {
              summary.firstMessage = chatMessages[0]; // full message object
              summary.firstMessageTime = chatMessages[0]?.timestamp || null;
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch first message for chat ${summary.chatId}:`, err);
        }
        return summary;
      })
    );

    return updatedSummaries;
  } catch (err) {
    console.error("Error reading chat summaries:", err);
    return [];
  }
};

export async function clearChat(chatId: string): Promise<void> {
  const store = await readStore();
  delete store[chatId];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export async function setChatTitle(chatId: string, title: string): Promise<void> {
  const store = await readStore();
  const chat = store[chatId] ?? { messages: [], title, lastUpdated: Date.now() };
  chat.title = title;
  store[chatId] = chat;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
