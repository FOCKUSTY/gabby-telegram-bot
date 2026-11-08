import type { Context, TelegramId } from "@/types";
import {
  BaseUserInteractionEvent,
  BaseUserInteractionEventWithText,
  InteractionData,
} from "./base-user-interaction.event";
import { PARSE_MODE } from "../constants";
import { env } from "@/env";

export class EditEvent extends BaseUserInteractionEventWithText {
  public readonly on = "edit" as const;

  public async executeUserInteraction(data: InteractionData): Promise<void> {
    await this.editMessage(data, env.SUPER_GROUP_TELEGRAM_ID);
  }

  public async executeAdminInteraction(data: InteractionData): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async executeTopicInteraction(data: InteractionData): Promise<void> {
    await this.editMessage(data, data.topic.user.telegramId);
  }

  protected async editMessage(
    { context, topic, user }: InteractionData,
    chatId: TelegramId,
  ) {
    const isDm = this.isDmChat(context);
    const sourceId = context.editedMessage?.message_id;
    const target = BaseUserInteractionEvent.findTarget(
      topic.topicId,
      sourceId,
      isDm,
    );
    if (!target) {
      return null;
    }

    const text = await this.buildMessage({ context, user, topic });
    return context.api.editMessageText(chatId, target, text, {
      parse_mode: PARSE_MODE,
    });
  }

  protected getMessageText(context: Context) {
    return context.editedMessage!.text!;
  }

  protected getMessageThreadId(context: Context) {
    return context.editedMessage!.message_thread_id;
  }
}
