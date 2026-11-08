import type { Bot } from "grammy";
import type { Context } from "@/types";

import { ChooseTopicHandler } from "./choose-topic.handler";
import { CallbackRegister } from "./handler-register";
import { MainMenuHandler } from "./main-menu.handler";
import { SettingsHandler } from "./settings.handler";
import { TopicSettingsHandler } from "./topic-settings.handler";

export const HANDLERS = [
  MainMenuHandler,
  ChooseTopicHandler,
  SettingsHandler,
  TopicSettingsHandler,
];
export const registry = new CallbackRegister();

export const registerHandlers = (bot: Bot<Context>) => {
  registry.add(...HANDLERS);

  bot.on("callback_query:data", async (context) => {
    await registry.dispatch(context);
  });
};
