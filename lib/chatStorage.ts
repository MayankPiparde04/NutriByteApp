// lib/chatStorage.ts
import { api } from './api';

export interface StoredMessage {
  id: string;
  text?: string;
  imageUri?: string;
  fromAI: boolean;
  timestamp: number;
  senderId?: string;
}

export interface ChatData {
  chatId: string;
  roomId: string;
  title: string;
  messages: StoredMessage[];
}

// Convert image URI to base64 for API
const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error('Failed to convert image to base64');
  }
};

export const getChatMessages = async (chatId: string): Promise<StoredMessage[]> => {
  try {
    const response = await api.getChatMessages(chatId);
    
    if (response.success && response.data) {
      // Convert backend message format to frontend format
      return response.data.messages.map((msg: any) => ({
        id: msg._id,
        text: msg.text,
        imageUri: msg.imageUri,
        fromAI: msg.fromAI,
        timestamp: new Date(msg.timestamp).getTime(),
        senderId: msg.senderId,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};

export const appendMessageToChat = async (
  chatId: string,
  message: StoredMessage
): Promise<{ chatId: string } | null> => {
  try {
    let messageData: any = {
      chatId: chatId.startsWith('session-') ? undefined : chatId, // Let backend create new chat if it's a session ID
      senderId: message.senderId,
      text: message.text,
      fromAI: message.fromAI,
    };

    // Handle image messages
    if (message.imageUri) {
      const base64Image = await convertImageToBase64(message.imageUri);
      messageData.imageUri = base64Image;
    }

    const response = await api.addMessage(messageData);
    
    if (response.success && response.data) {
      return { chatId: response.data._id };
    }
    
    return null;
  } catch (error) {
    console.error('Error appending message to chat:', error);
    throw error;
  }
};

export const getRecentChats = async (): Promise<any[]> => {
  try {
    const response = await api.getRecentChats();
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting recent chats:', error);
    return [];
  }
};