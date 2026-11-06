import "dotenv/config";
import { Env, isInteger, isPort } from "fenviee";

export const env = Env.create(process.env)({
  partial: ["PRISMA_CONNECTION_TYPE"],
  required: [
    "DATABASE_URL",
    "TELEGRAM_BOT_TOKEN",
    "BOT_CREATOR_ID",
    "SUPER_GROUP_TELEGRAM_ID",
  ],
  unique: {
    PORT: isPort,
    BOT_CREATOR_ID: isInteger,
  },
  default: {
    PRISMA_CONNECTION_TYPE: "adapter",
  },
});
