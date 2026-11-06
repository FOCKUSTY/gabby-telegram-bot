import type { Context } from "@/types";
import type { Bot } from "grammy";

import { start } from "./start";
import { settings } from "./settings";

export const COMMANDS = [start, settings];

export const registerCommands = (bot: Bot<Context>) => {
  for (const command of COMMANDS) {
    bot.command(command.name, command);
  }
};

export { start };
