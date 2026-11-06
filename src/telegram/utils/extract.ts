import type { Context, MyConversation, SessionData } from "@/types";

export const extractSession = async (
  context: Context,
  conversation?: MyConversation,
) => {
  const session =
    (await conversation?.external((context) => context.session)) ||
    context.session;
  if (!session) {
    throw new Error("Session not found.");
  }

  return session;
};

export const extractChat = (context: Context, session: SessionData) => {
  const chatId = context.chat?.id;
  if (!chatId) {
    throw new Error("Chat ID не найден");
  }

  const lastMessageId = session.last.botMessageId;
  const lastChatId = session.last.chatId;

  return {
    chatId,
    lastChatId,
    lastMessageId,
  };
};
