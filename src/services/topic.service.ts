import type { Context, TelegramId, TopicConfiguration } from "@/types";
import { Prisma } from "@/database";
import { fti } from "@/utils";
import { env } from "@/env";

export class TopicService {
  public constructor(public readonly prisma: Prisma = new Prisma()) {}

  public async find(userTelegramId: TelegramId) {
    const utid = fti(userTelegramId);
    const topics = await this.prisma.userTopic.findMany({
      where: {
        user: {
          telegramId: utid,
        },
      },
      include: {
        topic: true,
      },
    });

    return topics;
  }

  public async findByTopicTelegramId(topicTelegramId: TelegramId) {
    const ttid = fti(topicTelegramId);
    const topic = await this.prisma.topic.findUnique({
      where: {
        telegramId: ttid,
      },
      select: {
        id: true,
      },
    });

    if (!topic) {
      return null;
    }

    const userTopic = await this.prisma.userTopic.findUnique({
      where: {
        topicId: topic.id,
      },
      include: {
        topic: true,
        user: {
          select: {
            telegramId: true,
          },
        },
      },
    });

    return userTopic;
  }

  public async create(userTelegramId: TelegramId, topicTelegramId: TelegramId) {
    const utid = fti(userTelegramId);
    const ttid = fti(topicTelegramId);

    const topic = this.prisma.userTopic.create({
      data: {
        active: true,
        topic: {
          create: {
            telegramId: ttid,
          },
        },
        user: {
          connect: {
            telegramId: utid,
          },
        },
      },
      include: {
        topic: true,
      },
    });

    return topic;
  }

  public async createByContext(userTelegramId: TelegramId, context: Context) {
    const utid = fti(userTelegramId);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { telegramId: utid },
    });
    const forumTopic = await context.api.raw.createForumTopic({
      chat_id: env.SUPER_GROUP_TELEGRAM_ID,
      name: user.id,
    });

    const topicTelegramId = forumTopic.message_thread_id;
    return this.create(utid, topicTelegramId);
  }

  public update(id: string, configuration: TopicConfiguration, value: unknown) {
    return this.prisma.topic.update({
      where: {
        id,
      },
      data: {
        //@ts-ignore
        [configuration]: value,
      },
    });
  }
}
