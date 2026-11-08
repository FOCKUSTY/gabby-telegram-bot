import type {
  TelegramId,
  BaseUser,
  Topic,
  BaseUserTopic,
  UserConfiguration,
} from "@/types";
import { MS_PER_MINUTE } from "@/constants";
import { Cached, CacheInvalidate } from "@/decorators";
import { Prisma } from "@/database";
import { fti } from "@/utils";

import { TopicService } from "./topic.service";
import { SettingsService } from "./settings.service";

export class UserService {
  private readonly _include = {
    settings: true,
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
    public readonly settings: SettingsService = new SettingsService(),
  ) {}

  @Cached({ ttlMs: 5 * MS_PER_MINUTE, maxOperations: 100 })
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

  @Cached({ ttlMs: 5 * MS_PER_MINUTE, maxOperations: 50 })
  public async getUserTopics(telegramId: TelegramId): Promise<Topic[]> {
    const user = await this.findOrCreate(telegramId);
    return user.userTopics.map(({ topic }) => topic);
  }

  @Cached({ ttlMs: 5 * MS_PER_MINUTE, maxOperations: 50 })
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

  @CacheInvalidate({
    keysOf: ([telegramId]) => [
      `UserService:getActiveTopic:${telegramId}`,
      `UserService:getUserTopics:${telegramId}`,
      `UserService:findOrCreate:${telegramId}`,
    ],
  })
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
        await tx.userTopic.updateMany({
          data: {
            active: false,
          },
          where: {
            active: true,
            userId: user.id,
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

  @CacheInvalidate({
    keysOf: ([telegramId]) => [`UserService:findOrCreate:${telegramId}`],
  })
  public async updateUserSettings(
    telegramId: TelegramId,
    configuration: UserConfiguration,
    value: unknown,
  ) {
    const user = await this.findOrCreate(telegramId);
    const settings = await this.settings.findOrCreateByUserId(user.id);
    const updated = await this.settings.update(
      settings.id,
      configuration,
      value,
    );
    return updated;
  }

  public async updateNickname(telegramId: TelegramId, nickname: string) {
    const user = await this.findOrCreate(telegramId);
    return this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        baseNickname: nickname,
        nicknameForAdmin: user.nicknameForAdmin ?? nickname,
      },
    });
  }
}
