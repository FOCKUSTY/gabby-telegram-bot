import type { Context } from "@/types";
import type { Bot } from "grammy";

import { start } from "./start";
import { settings } from "./settings";
import { close, open } from "./open-close";

export const COMMANDS = [start, settings, open, close];

export const registerCommands = (bot: Bot<Context>) => {
  for (const command of COMMANDS) {
    bot.command(command.name, command);
  }
};

export { start };
