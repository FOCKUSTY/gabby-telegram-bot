import { InlineKeyboard } from "grammy";
import { toMainMenu } from "./main-menu.keyboard";
import { CALLBACK } from "../constants";

export const topicSettingsKeyboard = () => {
  const keyboard = new InlineKeyboard();

  keyboard.text("Сменить топик", CALLBACK.TOPIC.SETTINGS.CHANGE).row();
  keyboard.text("Переименовать", CALLBACK.TOPIC.SETTINGS.RENAME).row();

  toMainMenu(keyboard);

  return keyboard;
};
