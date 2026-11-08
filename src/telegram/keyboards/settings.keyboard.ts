import type { UserSettings } from "@/types";
import { InlineKeyboard } from "grammy";
import { buttonStyle } from "../utils";
import { CALLBACK } from "../constants";
import { toMainMenu } from "./main-menu.keyboard";

export const configurationsKeyboard = (settings: UserSettings) => {
  const keyboard = new InlineKeyboard();

  const id = CALLBACK.SETTINGS.CONFIGURATION.USER.CHANGE(
    "sendEnabled",
    `${!settings.sendEnabled}`,
  );

  keyboard
    .text("Отправлять сообщения", id)
    .style(buttonStyle(settings.sendEnabled))
    .row();

  keyboard
    .text(
      "Изменить никнейм (публичный)",
      CALLBACK.SETTINGS.CONFIGURATION.USER.CHANGE_NICKNAME,
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
