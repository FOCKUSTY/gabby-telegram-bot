import type { UserSettings } from "@/types";
import { InlineKeyboard } from "grammy";
import { iconInText } from "../utils";
import { CALLBACK } from "../constants";
import { toMainMenu } from "./main-menu.keyboard";

export const configurationsKeyboard = (settings: UserSettings) => {
  const keyboard = new InlineKeyboard();

  keyboard
    .text(
      iconInText("Автоматически входить в чат", settings.autoEnterTopic),
      CALLBACK.SETTINGS.CONFIGURATION.USER.CHANGE(
        "autoEnterTopic",
        `${!settings.autoEnterTopic}`,
      ),
    )
    .row();

  keyboard.text("<= Отмена", CALLBACK.SETTINGS.CONFIGURATION.USER.CANCEL).row();

  return keyboard;
};

export const settingsKeyboard = () => {
  const keyboard = new InlineKeyboard();

  keyboard
    .text("Изменить настройки", CALLBACK.SETTINGS.CONFIGURATION.USER.ENTER)
    .row();

  keyboard
    .text("Изменить топик", CALLBACK.SETTINGS.CONFIGURATION.TOPIC.ENTER)
    .row();

  toMainMenu(keyboard);

  return keyboard;
};
