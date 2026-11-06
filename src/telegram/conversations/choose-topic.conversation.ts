import type { Context, Conversation, MyConversation } from "@/types";
import { UserService } from "@/services";
import { getUserId } from "@/utils";
import { CALLBACK } from "../constants";
import { sendOrEdit } from "../utils";
import { chooseTopicKeyboard } from "../keyboards";

export class ChooseTopicConversation implements Conversation {
  public constructor(private user: UserService = new UserService()) {}

  public async execute(
    conversation: MyConversation,
    context: Context,
  ): Promise<void> {
    const id = getUserId(context.from);

    const topics = await this.user.getUserTopics(id);
    if (topics.length === 0) {
      const topic = await this.user.topic.createByContext(id, context);
      await sendOrEdit(context, `Создан новый топик: ${topic.topicId}`, {
        conversation,
      });
      return;
    }

    const keyboard = chooseTopicKeyboard(topics);
    await sendOrEdit(context, "Выберите топик", { keyboard, conversation });

    const topicCallback = await this.waitForCallback(
      conversation,
      CALLBACK.CHOOSE_TOPIC.PREFIX,
    );
    if (!topicCallback) {
      await sendOrEdit(context, "Произошла ошибка, попробуйте ещё раз", {
        conversation,
      });
      return;
    }

    const topicId = topicCallback.split(":")[1];
    const topic = await this.user.toggleTopicActive(id, topicId, true);
    await sendOrEdit(
      context,
      `Выбран новый топик: ${topic.topic.nameForUser ?? topic.topicId}`,
      { conversation },
    );
    return;
  }

  private async waitForCallback(
    conversation: MyConversation,
    prefix: string,
  ): Promise<string | null> {
    const callbackContext = await conversation.waitFor("callback_query:data");
    await callbackContext.answerCallbackQuery().catch(() => undefined);

    const data = callbackContext.callbackQuery?.data ?? null;
    if (!data) return null;
    if (data === CALLBACK.CANCEL) return null;
    if (!data.startsWith(`${prefix}:`)) return null;

    return data;
  }
}
