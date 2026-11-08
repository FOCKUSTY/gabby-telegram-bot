import type { Topic } from "@/types";

import { InlineKeyboard } from "grammy";
import { CALLBACK } from "../constants";
import { toMainMenu } from "./main-menu.keyboard";

export const chooseTopicKeyboard = (topics: Topic[]) => {
  const keyboard = new InlineKeyboard();
  topics.forEach((topic) => {
    keyboard
      .text(
        topic.nameForUser ?? topic.id,
        `${CALLBACK.CHOOSE_TOPIC.PREFIX}:${topic.id}`,
      )
      .row();
  });

  keyboard.text("+ Создать", CALLBACK.TOPIC.SETTINGS.CREATE).row();

  toMainMenu(keyboard);

  return keyboard;
};
