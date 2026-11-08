import { Context, TelegramId } from "@/types";
import { PARSE_MODE } from "../constants";

import {
  BaseUserInteractionEvent,
  BaseUserInteractionEventWithText,
  InteractionData,
} from "./base-user-interaction.event";

import { env } from "@/env";

export class MessageEvent extends BaseUserInteractionEventWithText {
  public readonly on = ":text" as const;

  public async executeUserInteraction({
    context,
    topic,
    user,
  }: InteractionData) {
    await this.sendMessage(
      { context, topic, user },
      env.SUPER_GROUP_TELEGRAM_ID,
      { message_thread_id: +topic.topic.telegramId },
    );
  }

  public async executeAdminInteraction({}: InteractionData): Promise<void> {
    throw new Error("Method not realized");
  }

  public async executeTopicInteraction({
    context,
    user,
    topic,
  }: InteractionData) {
    await this.sendMessage({ context, topic, user }, topic.user.telegramId);
  }

  protected async sendMessage(
    { context, topic, user }: InteractionData,
    chatId: TelegramId,
    extra?: Parameters<Context["api"]["sendMessage"]>[2],
  ) {
    const isDm = this.isDmChat(context);
    const sourceId = context.msg?.message_id;
    const replyToId = context.msg?.reply_to_message?.message_id;
    const target = BaseUserInteractionEvent.findTarget(
      topic.topicId,
      replyToId,
      isDm,
    );

    const text = await this.buildMessage({ context, user, topic });
    const message = await context.api.sendMessage(chatId, text, {
      parse_mode: PARSE_MODE,
      ...(target !== undefined && {
        reply_parameters: { message_id: target },
      }),
      ...extra,
    });

    BaseUserInteractionEvent.setTarget(
      topic.topicId,
      sourceId,
      message.message_id,
      isDm,
    );
  }

  protected getMessageText(context: Context) {
    return context.message?.text!;
  }

  protected getMessageThreadId(context: Context) {
    return context.message!.message_thread_id;
  }
}
