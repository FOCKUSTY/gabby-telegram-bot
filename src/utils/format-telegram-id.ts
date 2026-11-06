import { TelegramId } from "@/types";

export const formatTelegramId = (telegramId: TelegramId): string => {
  if (typeof telegramId === "string") {
    return telegramId;
  }

  return telegramId.toString();
};

export const fti = formatTelegramId;
