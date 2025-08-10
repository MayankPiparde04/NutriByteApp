import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import {
  appendMessageToChat,
  getChatMessages,
  StoredMessage,
} from "../../lib/chatStorage";

export default function REE() {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [keyboardHeight] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();
  const initialChatId = Array.isArray(params.chatId) 
    ? params.chatId[0] 
    : params.chatId ?? `session-${Date.now()}`;
  const [chatId, setChatId] = useState<string>(initialChatId);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Load chat messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId.startsWith("session-")) {
        try {
          // Try to load from backend first
          const response = await api.getChatMessages(chatId);
          if (response.success && response.data) {
            const backendMessages = response.data.messages.map((msg, index) => ({
              id: msg._id || index.toString(),
              text: msg.text,
              imageUri: msg.imageUri,
              fromAI: msg.fromAI,
              timestamp: new Date(msg.timestamp).getTime(),
              senderId: msg.senderId,
            }));
            setMessages(backendMessages);
            return;
          }
        } catch (error) {
          console.warn("Failed to load messages from backend:", error);
        }
        
        // Fallback to local storage
        const storedMessages = await getChatMessages(chatId);
        if (storedMessages.length) {
          setMessages(storedMessages);
        }
      }
    };

    loadMessages();
  }, [chatId]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === "ios" ? e.duration || 250 : 250,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === "ios" ? e.duration || 250 : 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  type Message = {
    id: string;
    text?: string;
    imageUri?: string;
    fromAI: boolean;
    timestamp: number;
  };

  const handleNewChat = async () => {
    const newId = `session-${Date.now()}`;
    setChatId(newId);
    setMessages([]);
    router.replace(`/ree?chatId=${newId}`);
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  async function getAIResponse(userText: string): Promise<Message> {
    setIsLoadingAI(true);
    try {
      const prompt = `As a nutrition AI assistant, provide helpful advice about: ${userText}. 
      Keep responses concise but informative. Include specific nutritional information when relevant.`;

      const response = await api.generateText(prompt);

      if (response.success && response.data) {
        return {
          id: Date.now().toString(),
          text: response.data.text,
          fromAI: true,
          timestamp: Date.now(),
        };
      } else {
        throw new Error(response.error || "Failed to get AI response");
      }
    } catch (error) {
      console.error("AI response error:", error);
      return {
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        fromAI: true,
        timestamp: Date.now(),
      };
    } finally {
      setIsLoadingAI(false);
    }
  }

  async function analyzeImage(imageUri: string): Promise<Message> {
    setIsLoadingAI(true);
    try {
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const analysisResponse = await api.analyzeImage(base64);

      if (analysisResponse.success && analysisResponse.data) {
        return {
          id: Date.now().toString(),
          text: analysisResponse.data.text,
          fromAI: true,
          timestamp: Date.now(),
        };
      } else {
        throw new Error(analysisResponse.error || "Failed to analyze image");
      }
    } catch (error) {
      console.error("Image analysis error:", error);
      return {
        id: Date.now().toString(),
        text: "Sorry, I couldn't analyze that image. Please make sure it contains food and try again.",
        fromAI: true,
        timestamp: Date.now(),
      };
    } finally {
      setIsLoadingAI(false);
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const userMessage = {
      text: inputText.trim(),
      fromAI: false,
      senderId: user.id,
    };

    // Create a local message for immediate UI update
    const localUserMsg: StoredMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      fromAI: false,
      timestamp: Date.now(),
      senderId: user.id,
    };

    setMessages((prev) => [...prev, localUserMsg]);
    setInputText("");

    try {
      // Send message to backend
      const response = await api.addMessage({
        chatId: chatId.startsWith("session-") ? undefined : chatId,
        ...userMessage,
      });

      if (response.success && response.data) {
        // Update chatId if it's a new chat
        if (chatId.startsWith("session-") && response.data._id) {
          setChatId(response.data._id);
        }

        // Get AI response
        const aiResponse = await api.generateText(userMessage.text);
        
        if (aiResponse.success && aiResponse.data) {
          const aiMessage = {
            chatId: response.data._id,
            text: aiResponse.data.text,
            fromAI: true,
            senderId: null,
          };

          // Add AI message to backend
          const aiBackendResponse = await api.addMessage(aiMessage);

          // Create local AI message for UI
          const localAiMsg: StoredMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.data.text,
            fromAI: true,
            timestamp: Date.now(),
            senderId: undefined,
          };

          setMessages((prev) => [...prev, localAiMsg]);
        }
      } else {
        // Fallback to local storage if backend fails
        console.warn("Backend failed, using local storage");
        const result = await appendMessageToChat(chatId, localUserMsg);
        if (result?.chatId && result.chatId !== chatId) {
          setChatId(result.chatId);
        }

        // Get AI response using fallback
        const aiMsg = await getAIResponse(userMessage.text);
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback to local storage
      try {
        const result = await appendMessageToChat(chatId, localUserMsg);
        if (result?.chatId && result.chatId !== chatId) {
          setChatId(result.chatId);
        }
        const aiMsg = await getAIResponse(userMessage.text);
        setMessages((prev) => [...prev, aiMsg]);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Camera roll permission is needed.");
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!pickerResult.canceled) {
        sendImageMessage(pickerResult.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Error", "Could not access gallery");
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Camera permission is needed.");
        return;
      }
      const cameraResult = await ImagePicker.launchCameraAsync({
        quality: 0.7,
      });
      if (!cameraResult.canceled) {
        sendImageMessage(cameraResult.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Error", "Could not access camera");
    }
  };

  const sendImageMessage = async (uri: string) => {
    if (!user) return;

    // Convert image to base64
    const response = await fetch(uri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    const userImageMessage = {
      imageUri: base64,
      fromAI: false,
      senderId: user.id,
    };

    // Create local message for immediate UI update
    const localUserImgMsg: StoredMessage = {
      id: Date.now().toString(),
      imageUri: uri, // Use original URI for display
      fromAI: false,
      timestamp: Date.now(),
      senderId: user.id,
    };

    setMessages((prev) => [...prev, localUserImgMsg]);

    try {
      // Send image message to backend
      const imageResponse = await api.addMessage({
        chatId: chatId.startsWith("session-") ? undefined : chatId,
        ...userImageMessage,
      });

      if (imageResponse.success && imageResponse.data) {
        // Update chatId if it's a new chat
        if (chatId.startsWith("session-") && imageResponse.data._id) {
          setChatId(imageResponse.data._id);
        }

        // Analyze image with AI
        const analysisResponse = await api.analyzeImage(base64);
        
        if (analysisResponse.success && analysisResponse.data) {
          const aiMessage = {
            chatId: imageResponse.data._id,
            text: analysisResponse.data.text,
            fromAI: true,
            senderId: null,
          };

          // Add AI analysis to backend
          await api.addMessage(aiMessage);

          // Create local AI message for UI
          const localAiMsg: StoredMessage = {
            id: (Date.now() + 1).toString(),
            text: analysisResponse.data.text,
            fromAI: true,
            timestamp: Date.now(),
            senderId: undefined,
          };

          setMessages((prev) => [...prev, localAiMsg]);
        }
      } else {
        // Fallback to local storage and analysis
        console.warn("Backend failed for image, using local storage");
        const result = await appendMessageToChat(chatId, localUserImgMsg);
        if (result?.chatId) setChatId(result.chatId);

        const aiImgMsg = await analyzeImage(uri);
        setMessages((prev) => [...prev, aiImgMsg]);
      }
    } catch (error) {
      console.error("Error sending image message:", error);
      // Fallback to local storage
      try {
        const result = await appendMessageToChat(chatId, localUserImgMsg);
        if (result?.chatId) setChatId(result.chatId);
        const aiImgMsg = await analyzeImage(uri);
        setMessages((prev) => [...prev, aiImgMsg]);
      } catch (fallbackError) {
        console.error("Image fallback also failed:", fallbackError);
        Alert.alert("Error", "Failed to send image. Please try again.");
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = !item.fromAI;

    return (
      <View className={`px-4 mb-4 ${isUser ? "items-end" : "items-start"}`}>
        <View
          className={`max-w-[80%] rounded-2xl overflow-hidden ${
            isUser
              ? isDark
                ? "bg-blue-600"
                : "bg-blue-500"
              : isDark
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {item.text ? (
            <View className="p-4">
              <Text
                className={`text-base leading-6 ${
                  isUser
                    ? "text-white font-medium"
                    : isDark
                      ? "text-gray-100"
                      : "text-gray-800"
                }`}
              >
                {item.text}
              </Text>
            </View>
          ) : item.imageUri ? (
            <View className="p-2">
              <Image
                source={{ uri: item.imageUri }}
                className="w-56 h-56 rounded-xl"
                resizeMode="cover"
              />
            </View>
          ) : null}
        </View>

        <Text
          className={`text-xs mt-1 px-2 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2">Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top }}
      className={isDark ? "bg-gray-950" : "bg-gray-50"}
    >
      {/* Header */}
      <View
        className={`pb-4 pt-2 ${isDark ? "bg-gray-900" : "bg-white"}`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center justify-between px-4">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              try {
                router.push("/(tabs)");
              } catch (error) {
                console.log("Navigation error:", error);
              }
            }}
            className={`p-3 rounded-full ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#e5e7eb" : "#374151"}
            />
          </TouchableOpacity>

          {/* Title + Subtitle */}
          <View className="items-center">
            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              REE
            </Text>
            <Text
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              AI Nutrition Assistant
            </Text>
          </View>

          {/* Actions Row */}
          <View className="flex-row items-center space-x-3">
            {/* New Chat Button */}
            <TouchableOpacity
              onPress={handleNewChat}
              className={`p-3 rounded-full ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <Ionicons
                name="add"
                size={24}
                color={isDark ? "#e5e7eb" : "#374151"}
              />
            </TouchableOpacity>

            {/* Profile Button */}
            <TouchableOpacity
              onPress={() => {
                try {
                  router.push("/(tabs)/profile");
                } catch (error) {
                  console.log("Navigation error:", error);
                }
              }}
              className={`p-3 rounded-full ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <Ionicons
                name="person-circle"
                size={24}
                color={isDark ? "#e5e7eb" : "#374151"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Messages area */}
      <View className="flex-1">
        {messages.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <View
              className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Ionicons
                name="chatbubbles"
                size={32}
                color={isDark ? "#6b7280" : "#9ca3af"}
              />
            </View>
            <Text
              className={`text-xl font-semibold mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Welcome to REE!
            </Text>
            <Text
              className={`text-center leading-6 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Ask me anything about nutrition, send photos of your meals, or get
              personalized dietary advice.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            className="flex-1"
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
          />
        )}

        {/* AI Loading Indicator */}
        {isLoadingAI && (
          <View className="flex-row items-center justify-start px-4 mb-4">
            <View
              className={`p-4 rounded-2xl ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <View className="flex-row items-center">
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#6b7280" : "#9ca3af"}
                />
                <Text
                  className={`ml-2 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  AI is thinking...
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <Animated.View
          style={{
            paddingBottom:
              Platform.OS === "ios"
                ? insets.bottom
                : Animated.add(keyboardHeight, insets.bottom),
          }}
        >
          <View
            className={`px-4 py-4 ${isDark ? "bg-gray-900" : "bg-white"}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <View className="flex-row items-end space-x-3">
              {/* Camera button */}
              <TouchableOpacity
                onPress={takePhoto}
                disabled={isLoadingAI}
                className={`p-3 rounded-full ${
                  isLoadingAI
                    ? "bg-gray-400"
                    : isDark
                      ? "bg-green-600"
                      : "bg-green-500"
                }`}
              >
                <Ionicons name="camera" size={24} color="white" />
              </TouchableOpacity>

              {/* Gallery button */}
              <TouchableOpacity
                onPress={pickImage}
                disabled={isLoadingAI}
                className={`p-3 rounded-full ${
                  isLoadingAI
                    ? "bg-gray-400"
                    : isDark
                      ? "bg-purple-600"
                      : "bg-purple-500"
                }`}
              >
                <Ionicons name="image" size={24} color="white" />
              </TouchableOpacity>

              {/* Text input */}
              <View className="flex-1">
                <TextInput
                  className={`px-4 py-3 rounded-2xl border text-base ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                  placeholder="Type your message..."
                  placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={1000}
                  editable={!isLoadingAI}
                  style={{
                    maxHeight: 100,
                  }}
                />
              </View>

              {/* Send button */}
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoadingAI}
                className={`p-3 rounded-full ${
                  inputText.trim() && !isLoadingAI
                    ? isDark
                      ? "bg-blue-600"
                      : "bg-blue-500"
                    : isDark
                      ? "bg-gray-700"
                      : "bg-gray-300"
                }`}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={
                    inputText.trim() && !isLoadingAI
                      ? "white"
                      : isDark
                        ? "#6b7280"
                        : "#9ca3af"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
