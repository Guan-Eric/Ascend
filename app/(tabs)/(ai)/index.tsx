import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { FlashList } from "@shopify/flash-list";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import OpenAI from "openai";
import Markdown from "react-native-markdown-display";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI calisthenics coach. I can help you with form tips, progression advice, workout planning, and answering any questions about your training. How can I assist you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flashListRef = useRef<FlashList<Message>>(null);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: Constants.expoConfig?.extra?.openaiApiKey,
  });

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      // Get user context
      const userId = FIREBASE_AUTH.currentUser?.uid;
      let userContext = "";

      if (userId) {
        const user = await backend.getUser(userId);
        const stats = await backend.getUserProgressStats(userId);

        if (user) {
          userContext = `User Info: ${user.level} level, training ${user.trainingDaysPerWeek} days/week, goal: ${user.goalType} (${user.primaryGoalId}). Completed ${stats.totalExercisesCompleted} exercises.`;
        }
      }

      // Call OpenAI API using the client
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert calisthenics coach. You provide helpful, encouraging advice about bodyweight training, skill progressions, form tips, and workout programming. Be concise but thorough. ${userContext}`,
          },
          ...messages.slice(-5).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user",
            content: currentInput,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content =
        response.choices[0].message?.content ||
        "I'm sorry, I couldn't generate a response.";

      const assistantMessage: Message = {
        role: "assistant",
        content: content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error calling OpenAI:", error);

      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please make sure your OpenAI API key is configured correctly.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to end when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <View
      className={`mb-4 ${item.role === "user" ? "items-end" : "items-start"}`}
    >
      <View
        className={`max-w-[80%] p-4 rounded-2xl ${
          item.role === "user"
            ? "bg-primary"
            : "bg-surface border border-border"
        }`}
      >
        {item.role === "assistant" && (
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons
              name="robot-outline"
              size={20}
              color="#38e8ff"
            />
            <Text className="text-primary font-bold ml-2">AI Coach</Text>
          </View>
        )}

        {item.role === "user" ? (
          <Text className="text-background leading-6">{item.content}</Text>
        ) : (
          <Markdown
            style={{
              body: { color: "#ffffff" },
              heading3: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
              strong: { fontWeight: "bold" },
              paragraph: { marginBottom: 8 },
            }}
          >
            {item.content}
          </Markdown>
        )}

        <Text
          className={`text-xs mt-2 ${
            item.role === "user" ? "text-background/70" : "text-text-muted"
          }`}
        >
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View className="items-start mb-4">
        <View className="bg-surface border border-border p-4 rounded-2xl">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="robot-outline"
              size={20}
              color="#38e8ff"
            />
            <Text className="text-text-primary font-bold ml-2">
              AI Coach is typing...
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
      keyboardVerticalOffset={100}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-4 bg-surface border-b border-border">
          <Text className="text-text-primary text-4xl font-bold mb-1">
            AI Coach
          </Text>
          <Text className="text-text-secondary text-sm">
            Your personal calisthenics assistant
          </Text>
        </View>

        {/* Messages */}
        <View className="flex-1 px-6 pt-4">
          <FlashList
            ref={flashListRef}
            data={messages}
            renderItem={renderMessage}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyExtractor={(item, index) => `${item.timestamp}-${index}`}
          />
        </View>

        {/* Input */}
        <View className="px-6 pb-4 pt-4 bg-surface border-t border-border">
          <View className="flex-row items-center">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything about calisthenics..."
              placeholderTextColor="#7a86a8"
              multiline
              maxLength={500}
              className="flex-1 bg-surface-elevated text-text-primary px-4 py-3 rounded-xl mr-3 max-h-32"
            />
            <Pressable
              onPress={sendMessage}
              disabled={!input.trim() || loading}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                input.trim() && !loading ? "bg-primary" : "bg-surface-elevated"
              }`}
            >
              <MaterialCommunityIcons
                name="send"
                size={24}
                color={input.trim() && !loading ? "#000000" : "#7a86a8"}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
