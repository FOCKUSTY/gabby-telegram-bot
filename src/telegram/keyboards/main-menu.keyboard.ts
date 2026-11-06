import { InlineKeyboard } from "grammy";
import { CALLBACK } from "../constants";

export const toMainMenu = (keyboard: InlineKeyboard) => {
  keyboard.text("<= В главное меню", CALLBACK.MAIN_MENU).row();
};

export const mainMenuKeyboard = () => {
  const keyboard = new InlineKeyboard();

  keyboard.text("Войти в топик", CALLBACK.TOPIC.ENTER);
  keyboard.text("Сменить топик", CALLBACK.TOPIC.CHANGE);
  keyboard.row();
  keyboard.text("Настройки", CALLBACK.SETTINGS.ENTER);

  return keyboard;
};
