import type { BaseUser, BaseUserTopic, Context } from "@/types";

import { UserService } from "@/services";
import { getUserId } from "@/utils";
import { StringBuilder } from "../utils";

export type InteractionData = {
  readonly context: Context;
  readonly user: BaseUser;
  readonly topic: BaseUserTopic;
};

export abstract class BaseUserInteractionEvent {
  public static readonly RAW_MESSAGES_CONTEXT: {
    dmToTm: Map<number, number>;
    tmToDm: Map<number, number>;
  } = {
    dmToTm: new Map(),
    tmToDm: new Map(),
  };

  protected static readonly MESSAGES_CONTEXT: {
    [topicId: string]: {
      dmToTm: Map<number, number>;
      tmToDm: Map<number, number>;
    };
  } = {};

  protected static getStore(topicId: string) {
    const store = (BaseUserInteractionEvent.MESSAGES_CONTEXT[topicId] ??= {
      dmToTm: new Map<number, number>(),
      tmToDm: new Map<number, number>(),
    });

    return store;
  }

  protected static findTarget(
    topicId: string,
    targetId: number | undefined,
    isDm: boolean,
  ) {
    const store = this.getStore(topicId);
    const target =
      targetId !== undefined
        ? isDm
          ? store.dmToTm.get(targetId)
          : store.tmToDm.get(targetId)
        : undefined;

    return target;
  }

  protected static setTarget(
    topicId: string,
    sourceId: number | undefined,
    messageId: number,
    isDm: boolean,
  ) {
    const store = this.getStore(topicId);
    if (sourceId !== undefined) {
      const dmId = isDm ? sourceId : messageId;
      const tmId = isDm ? messageId : sourceId;

      this.RAW_MESSAGES_CONTEXT.dmToTm.set(dmId, tmId);
      this.RAW_MESSAGES_CONTEXT.tmToDm.set(tmId, dmId);

      store.dmToTm.set(dmId, tmId);
      store.tmToDm.set(tmId, dmId);
    }
  }

  public constructor(
    protected readonly user: UserService = new UserService(),
  ) {}

  public async execute(context: Context) {
    const id = getUserId(context.from);
    const user = await this.user.findOrCreate(id);

    await this.userInteraction(context, user);
    await this.adminInteraction(context, user);
    await this.topicInteraction(context, user);
  }

  public abstract executeUserInteraction(data: InteractionData): Promise<void>;
  public abstract executeAdminInteraction(data: InteractionData): Promise<void>;
  public abstract executeTopicInteraction(data: InteractionData): Promise<void>;

  protected abstract getMessageThreadId(context: Context): number | undefined;

  protected async userInteraction(context: Context, user: BaseUser) {
    if (!this.isDmChat(context)) {
      return;
    }

    const topic = await this.user.getActiveTopic(user.telegramId);
    if (!topic) {
      return context.reply("Выберите топик");
    }

    await this.executeUserInteraction({ context, user, topic });
  }

  protected async adminInteraction(context: Context, user: BaseUser) {
    if (!this.isDmChat(context)) {
      return;
    }

    return;
    // await this.executeAdminInteraction(context, user);
  }

  protected async topicInteraction(context: Context, user: BaseUser) {
    if (this.isDmChat(context)) {
      return;
    }

    const topicTelegramId = this.getMessageThreadId(context);
    if (!topicTelegramId) {
      throw new Error("chatId is is not defined");
    }

    const topic = await this.user.topic.findByTopicTelegramId(topicTelegramId);
    if (!topic) {
      return context.reply("Топик не был найден");
    }

    await this.executeTopicInteraction({ context, user, topic });
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

export abstract class BaseUserInteractionEventWithText extends BaseUserInteractionEvent {
  protected abstract getMessageText(context: Context): string;

  protected async buildMessage({ context, user }: InteractionData) {
    const builder = new StringBuilder();

    builder.appendLine(this.getMessageText(context));
    builder.appendRawLine(
      `<blockquote>От <b>${user.nickname ?? user.id}</b></blockquote>`,
    );

    return builder.toString();
  }
}
