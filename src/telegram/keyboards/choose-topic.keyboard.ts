import type { Topic } from "@/types";

import { InlineKeyboard } from "grammy";
import { CALLBACK } from "../constants";

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

  return keyboard;
};
