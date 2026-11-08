import type { Context, Conversation, MyConversation } from "@/types";
import { UserService } from "@/services";
import { getUserId } from "@/utils";
import { sendOrEdit } from "../utils";
import { settingsKeyboard } from "../keyboards";

export class ChangeNicknameConversation implements Conversation {
  public constructor(private user: UserService = new UserService()) {}

  public async execute(
    conversation: MyConversation,
    context: Context,
  ): Promise<void> {
    const id = getUserId(context.from);

    const checkpoint = conversation.checkpoint();
    await sendOrEdit(
      context,
      "Введите псевдоним (увидят все) (3-20 символов)",
      {
        conversation,
      },
    );
    const textContext = await conversation.waitFor(":text");
    const text = textContext.msg.text;
    const name = text.trim();
    if (name.length < 3 || name.length > 20) {
      await sendOrEdit(context, "Псевдоним не подходит по длине", {
        conversation,
        edit: false,
      });
      conversation.rewind(checkpoint);
      return;
    }

    const updatedUser = await this.user.updateNickname(id, name);
    await context.api.deleteMessage(textContext.chatId, textContext.msgId);
    await sendOrEdit(
      context,
      `Название изменено на ${updatedUser.baseNickname} у пользователя ${updatedUser.id}`,
      {
        conversation,
        keyboard: settingsKeyboard(),
      },
    );
  }
}
