import type { UserConfiguration, TelegramId } from "@/types";
import { MS_PER_MINUTE } from "@/constants";
import { Cached, CacheInvalidate, defaultCache } from "@/decorators";
import { Prisma } from "@/database";
import { fti } from "@/utils";

export class SettingsService {
  public constructor(public readonly prisma: Prisma = new Prisma()) {}

  @Cached({ ttlMs: 10 * MS_PER_MINUTE, maxOperations: 30 })
  public async findOrCreateByUserId(userId: string) {
    const settings = await this.prisma.userSettings.findUnique({
      where: {
        userId: userId,
      },
    });

    if (settings) {
      return settings;
    }

    const createdSettings = await this.prisma.userSettings.create({
      data: {
        userId: userId,
      },
    });

    return createdSettings;
  }

  public async findOrCreate(telegramId: TelegramId) {
    const tid = fti(telegramId);
    const user = await this.prisma.user.findUnique({
      where: { telegramId: tid },
      include: {
        settings: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.settings) {
      return user.settings;
    }

    return this.findOrCreateByUserId(user.id);
  }

  @CacheInvalidate({
    keysOf: ([id]) => [`SettingsService:findOrCreateByUserId:${id}`],
  })
  public async update(
    id: string,
    configuration: UserConfiguration,
    value: unknown,
  ) {
    const updated = await this.prisma.userSettings.update({
      where: {
        id,
      },
      data: {
        //@ts-ignore
        [configuration]: value,
      },
    });

    return updated;
  }
}
