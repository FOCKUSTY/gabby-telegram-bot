import type { Context, TelegramId, TopicConfiguration } from "@/types";
import { MS_PER_MINUTE } from "@/constants";
import { Cached, CacheInvalidate } from "@/decorators";
import { Prisma } from "@/database";
import { fti } from "@/utils";
import { env } from "@/env";

export class TopicService {
  public constructor(public readonly prisma: Prisma = new Prisma()) {}

  @Cached({ ttlMs: 10 * MS_PER_MINUTE, maxOperations: 30 })
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

  @Cached({ ttlMs: 10 * MS_PER_MINUTE, maxOperations: 30 })
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

  @CacheInvalidate({
    all: true,
  })
  public async create(
    userTelegramId: TelegramId,
    topicTelegramId: TelegramId,
    name?: string,
  ) {
    const utid = fti(userTelegramId);
    const ttid = fti(topicTelegramId);

    const topic = this.prisma.userTopic.create({
      data: {
        active: true,
        topic: {
          create: {
            telegramId: ttid,
            nameForUser: name,
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

  public async createByContext(
    userTelegramId: TelegramId,
    context: Context,
    name?: string,
  ) {
    const utid = fti(userTelegramId);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { telegramId: utid },
    });
    const forumTopic = await context.api.raw.createForumTopic({
      chat_id: env.SUPER_GROUP_TELEGRAM_ID,
      name: user.id,
    });

    const topicTelegramId = forumTopic.message_thread_id;
    return this.create(utid, topicTelegramId, name);
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
