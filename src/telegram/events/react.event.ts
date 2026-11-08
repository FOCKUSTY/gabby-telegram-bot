import type { Context } from "@/types";
import { BaseUserInteractionEvent } from "./base-user-interaction.event";
import { UserService } from "@/services";
import { getUserId } from "@/utils";
import { env } from "@/env";

export class ReactEvent {
  public readonly on = "message_reaction" as const;

  public constructor(
    protected readonly user: UserService = new UserService(),
  ) {}

  public async execute(context: Context) {
    const isDm = this.isDmChat(context);
    const sourceId = context.messageReaction?.message_id!;
    let target: number | undefined = undefined;
    if (isDm) {
      target =
        BaseUserInteractionEvent.RAW_MESSAGES_CONTEXT.dmToTm.get(sourceId);
    } else {
      target =
        BaseUserInteractionEvent.RAW_MESSAGES_CONTEXT.tmToDm.get(sourceId);
    }

    if (!target) {
      return null;
    }

    const chatId = await this.getChatId(context);
    if (!chatId) {
      return;
    }

    await context.api.setMessageReaction(
      chatId,
      target,
      context.messageReaction?.new_reaction ?? [],
    );
  }

  protected async getChatId(context: Context) {
    if (this.isDmChat(context)) {
      return env.SUPER_GROUP_TELEGRAM_ID;
    }

    const id = getUserId(context.from);
    const user = await this.user.findOrCreate(id);
    const topic = await this.user.getActiveTopic(user.telegramId);
    if (!topic) {
      context.reply("Выберите топик");
      return null;
    }

    return topic.user.telegramId;
  }

  protected isDmChat(context: Context) {
    const chatId = context.chatId;
    if (!chatId) {
      return false;
    }

    const userId = getUserId(context.from);
    if (chatId !== userId) {
      return false;
    }

    return true;
  }
}
