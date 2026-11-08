import type { Context, Conversation, MyConversation } from "@/types";
import type { Bot } from "grammy";

import { createConversation } from "@grammyjs/conversations";

import { ChooseTopicConversation } from "./choose-topic.conversation";
import { SettingsConversation } from "./settings.conversation";
import { RenameTopicConversation } from "./rename-topic.conversation";
import { CreateTopicConversation } from "./create-topic.conversation";
import { ChangeNicknameConversation } from "./change-nickname.conversation";

export const CONVERSATIONS: {
  name: string;
  conversation: Conversation;
}[] = [
  ChooseTopicConversation,
  SettingsConversation,
  RenameTopicConversation,
  CreateTopicConversation,
  ChangeNicknameConversation,
].map((conversationClass) => ({
  name: conversationClass.name,
  conversation: new conversationClass(),
}));

export const registerConversations = (bot: Bot<Context>) => {
  for (const { conversation, name } of CONVERSATIONS) {
    const botConversation = createConversation(
      (myConversation: MyConversation, context: Context) => {
        return conversation.execute.call(conversation, myConversation, context);
      },
      name,
    );

    bot.use(botConversation);
  }
};

export * from "./handlers";

export { ChooseTopicConversation, SettingsConversation };
