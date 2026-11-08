import { env } from "@/env";

import type { Context } from "@/types";

import { listen } from "@/app";
import { Bot, session } from "grammy";
import { conversations } from "@grammyjs/conversations";

import { registerConversations, registerHandlers } from "./conversations";
import { registerCommands } from "./commands";
import { registerEvents } from "./events";

export const bot = new Bot<Context>(env.TELEGRAM_BOT_TOKEN);

bot.use(
  session({
    initial: () => ({
      last: {},
    }),
  }),
);

bot.use(conversations<Context, Context>());

void registerConversations(bot);
void registerCommands(bot);
void registerHandlers(bot);
void registerEvents(bot);

bot.start({
  onStart: (botInfo) => {
    console.log("Bot started as " + botInfo.username);

    listen();
  },
  allowed_updates: ["message_reaction", "message", "edited_message"],
});

bot.catch((error) => {
  return console.error(error);
});
