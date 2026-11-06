import type { TelegramId, BaseUser, Topic, BaseUserTopic } from "@/types";
import { Prisma } from "@/database";
import { fti } from "@/utils";

import { TopicService } from "./topic.service";

export class UserService {
  private readonly _include = {
    userTopics: {
      include: {
        topic: true,
        user: {
          select: {
            telegramId: true,
          },
        },
      },
    },
  };

  public constructor(
    public readonly prisma: Prisma = new Prisma(),
    public readonly topic: TopicService = new TopicService(),
  ) {}

  public async findOrCreate(telegramId: TelegramId): Promise<BaseUser> {
    const tid = fti(telegramId);
    const user = await this.prisma.user.findUnique({
      where: { telegramId: tid },
      include: this._include,
    });

    if (user) {
      return user;
    }

    return this.prisma.user.create({
      data: {
        telegramId: tid,
        settings: {
          create: {},
        },
      },
      include: this._include,
    });
  }

  public async getUserTopics(telegramId: TelegramId): Promise<Topic[]> {
    const user = await this.findOrCreate(telegramId);
    return user.userTopics.map(({ topic }) => topic);
  }

  public async getActiveTopic(
    telegramId: TelegramId,
  ): Promise<BaseUserTopic | null> {
    const user = await this.findOrCreate(telegramId);
    const userTopics = user.userTopics.filter((topic) => topic.active);
    if (userTopics.length > 1) {
      throw new Error("NOT ACCEPTABLE");
    }

    const topic = userTopics[0];
    if (!topic) {
      return null;
    }

    return userTopics[0];
  }

  public async toggleTopicActive(
    telegramId: TelegramId,
    topicId: string,
    active: boolean,
  ): Promise<BaseUserTopic> {
    const user = await this.findOrCreate(telegramId);
    const where = { userId_topicId: { userId: user.id, topicId } };
    const topic = await this.prisma.userTopic.findUnique({
      where,
    });
    if (!topic) {
      throw new Error("Topic not found");
    }

    if (active === true) {
      return this.prisma.$transaction(async (tx) => {
        tx.userTopic.updateMany({
          data: {
            active: false,
          },
          where: {
            active: true,
          },
        });

        return tx.userTopic.update({
          where,
          data: {
            active: true,
          },
          include: this._include.userTopics.include,
        });
      });
    }

    return this.prisma.userTopic.update({
      where,
      data: { active },
      include: this._include.userTopics.include,
    });
  }
}
