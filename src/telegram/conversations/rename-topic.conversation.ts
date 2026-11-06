import type { Context, Conversation, MyConversation } from "@/types";
import { UserService } from "@/services";
import { getUserId } from "@/utils";
import { sendOrEdit } from "../utils";
import { mainMenuKeyboard, settingsKeyboard } from "../keyboards";

export class RenameTopicConversation implements Conversation {
  public constructor(private readonly user: UserService = new UserService()) {}

  public async execute(
    conversation: MyConversation,
    context: Context,
  ): Promise<void> {
    const id = getUserId(context.from);
    const topic = await this.user.getActiveTopic(id);
    if (!topic) {
      return sendOrEdit(context, "Нет активного топика", {
        keyboard: mainMenuKeyboard(),
      });
    }

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
      conversation.rewind(checkpoint);
      return;
    }

    const updatedTopic = await this.user.topic.update(
      topic.topicId,
      "name",
      name,
    );
    await context.api.deleteMessage(textContext.chatId, textContext.msgId);
    await sendOrEdit(
      context,
      `Название изменено на ${updatedTopic.nameForUser} у топика ${updatedTopic.id}`,
      {
        conversation,
        keyboard: settingsKeyboard(),
      },
    );
  }
}
