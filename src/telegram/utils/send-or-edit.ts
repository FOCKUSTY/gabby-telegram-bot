import { Context, MyConversation, SessionData } from "@/types";
import { InlineKeyboard } from "grammy";
import { extractChat, extractSession } from "./extract";
import { PARSE_MODE } from "../constants";

export const sendOrEdit = async (
  context: Context,
  text: string,
  {
    keyboard,
    session,
    conversation,
    edit = true,
  }: {
    keyboard?: InlineKeyboard;
    session?: SessionData;
    conversation?: MyConversation;
    edit?: boolean;
  },
) => {
  session = await extractSession(context, conversation);
  const { chatId, lastChatId, lastMessageId } = extractChat(context, session);

  const reply = async () => {
    const msg = await context.reply(text, {
      reply_markup: keyboard,
      parse_mode: PARSE_MODE,
    });

    if (edit) {
      session.last.botMessageId = msg.message_id;
    }
    session.last.chatId = chatId;
  };

  try {
    if (!edit) {
      return reply();
    }

    if (!lastMessageId || lastChatId !== chatId) {
      return reply();
    }

    await context.api
      .editMessageText(chatId, lastMessageId, text, {
        reply_markup: keyboard,
        parse_mode: PARSE_MODE,
      })
      .catch(reply);

    if (!context.message) {
      return;
    }
  } catch (error) {
    return reply();
  } finally {
    await conversation?.external((context) => {
      context.session = session;
    });
  }
};
