import type { BaseUser, BaseUserTopic, Context } from "@/types";
import { UserService } from "@/services";
import { getUserId } from "@/utils";

export type InteractionData = {
  readonly context: Context;
  readonly user: BaseUser;
  readonly topic: BaseUserTopic;
};

export abstract class BaseUserInteractionEvent {
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

    const topicTelegramId = context.message?.message_thread_id;
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
