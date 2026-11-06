import type { Context } from "@/types";
import type { Bot } from "grammy";
import { MessageEvent } from "./message.event";

const EVENTS = [MessageEvent].map((eventClass) => new eventClass());

export const registerEvents = (bot: Bot<Context>) => {
  for (const event of EVENTS) {
    bot.on(event.on, async (context) => {
      await event.execute(context);
    });
  }
};

export { MessageEvent };
