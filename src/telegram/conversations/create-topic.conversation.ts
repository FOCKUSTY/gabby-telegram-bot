import type { Context, Conversation, MyConversation } from "@/types";
import { UserService } from "@/services";
import { getUserId } from "@/utils";
import { sendOrEdit } from "../utils";
import { chooseTopicKeyboard } from "../keyboards";

export class CreateTopicConversation implements Conversation {
  public constructor(private readonly user: UserService = new UserService()) {}

  public async execute(
    conversation: MyConversation,
    context: Context,
  ): Promise<void> {
    const id = getUserId(context.from);
    const topics = await this.user.getUserTopics(id);

    const checkpoint = conversation.checkpoint();
    await sendOrEdit(context, "Введите название топика (3-20 символов)", {
      conversation,
    });
    const textContext = await conversation.waitFor(":text");
    const text = textContext.msg.text;
    const name = text.trim();
    if (name.length < 3 || name.length > 20) {
      await sendOrEdit(context, "Название не подходит по длине", {
        conversation,
        edit: false,
      });
      await conversation.rewind(checkpoint);
      return;
    }

    if (topics.some(({ nameForUser }) => nameForUser === name)) {
      await sendOrEdit(context, "Название не подходит по длине", {
        conversation,
        edit: false,
      });
      await conversation.rewind(checkpoint);
      return;
    }

    const topic = await this.user.topic.createByContext(id, context, name);
    await context.api.deleteMessage(textContext.chatId, textContext.msgId);
    await sendOrEdit(
      context,
      `Создан топик ${topic.topic.nameForUser ?? topic.topicId}`,
      {
        conversation,
        keyboard: chooseTopicKeyboard([...topics, topic.topic]),
      },
    );
  }
}
