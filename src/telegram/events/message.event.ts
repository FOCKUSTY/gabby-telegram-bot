import { Context } from "@/types";
import { PARSE_MODE } from "../constants";

import { BaseUserInteractionEvent } from "./base-user-interaction.event";
import { InteractionData } from "./base-user-interaction.event";

import { StringBuilder } from "../utils";
import { getUserId } from "@/utils";
import { env } from "@/env";

export class MessageEvent extends BaseUserInteractionEvent {
  public readonly on = ":text" as const;

  public async executeUserInteraction({
    context,
    topic,
    user,
  }: InteractionData): Promise<void> {
    const text = await this.buildMessage({ context, user, topic });

    await context.api.sendMessage(env.SUPER_GROUP_TELEGRAM_ID, text, {
      message_thread_id: +topic.topic.telegramId,
      parse_mode: PARSE_MODE,
    });
  }

  public async executeAdminInteraction({}: InteractionData): Promise<void> {
    throw new Error("Method not realized");
  }

  public async executeTopicInteraction({
    context,
    user,
    topic,
  }: InteractionData): Promise<void> {
    const text = await this.buildMessage({ context, user, topic });

    await context.api.sendMessage(topic.user.telegramId, text, {
      parse_mode: PARSE_MODE,
    });
  }

  protected async buildMessage({ context, user }: InteractionData) {
    const reply = context.message?.reply_to_message?.text;
    const replyFrom = context.message?.reply_to_message?.from;

    const builder = new StringBuilder();

    builder.appendLine().appendLine(context.message!.text!);

    builder
      .appendRaw(
        `<blockquote>От <b>${user.nickname ?? user.id}</b></blockquote>`,
      )
      .appendLine();

    if (reply) {
      const replyUser = await this.extractUser(replyFrom);
      if (!replyUser) {
        throw new Error("replyUser is not defined");
      }

      builder.appendRaw(
        `<blockquote>На <i>(${replyUser.nickname ?? replyUser.id}): ${StringBuilder.truncate(`${reply}`, 20)}</i></blockquote>`,
      );
    }

    return builder.toString();
  }

  private extractUser(from: Context["from"]) {
    const id = getUserId(from);
    const user = this.user.findOrCreate(id);
    return user;
  }
}
