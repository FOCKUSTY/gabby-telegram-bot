import type { Context as GrammyContext, SessionFlavor } from "grammy";
import type {
  Conversation as GrammyConversation,
  ConversationFlavor,
} from "@grammyjs/conversations";

export type SessionData = {
  last: {
    botMessageId?: number;
    chatId: number;
  };
};

export type TelegramId = number | string;
export type Context = SessionFlavor<SessionData> &
  ConversationFlavor<GrammyContext>;

export type MyConversation = GrammyConversation<Context, Context>;

export type Conversation = {
  execute(conversation: MyConversation, context: Context): Promise<void>;
};

export type CallbackHandler = (context: Context) => Promise<unknown>;

export type CallbackMatcher = {
  verify(data: string): boolean;
  handle(context: Context): Promise<unknown>;
};

export type CallbackHandlerModule = {
  execute(): void;
};
