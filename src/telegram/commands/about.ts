import type { Context } from "@/types";

import { sendOrEdit, StringBuilder } from "../utils";

const text = new StringBuilder()
  .bold(`Gabby`)
  .appendLine(" — анонимный мост для общения с администрацией.")
  .newLine()
  .bold("Возможности:")
  .newLine()
  .appendLine("• Персональный топик для каждого пользователя")
  .appendLine("• Пересылка сообщений между ЛС и супергруппой")
  .appendLine("• Переключение между несколькими топиками")
  .appendLine("• Пауза пересылки в любой момент")
  .newLine()
  .bold("Команды:")
  .newLine()
  .appendLine("/start — запуск бота")
  .appendLine("/settings — настройки")
  .appendLine("/open — включить пересылку")
  .appendLine("/close — выключить пересылку")
  .appendLine("/about — эта справка")
  .newLine()
  .italic("MIT © FOCKUSTY")
  .toString();

export const about = async (context: Context) => {
  return sendOrEdit(context, text, { session: context.session });
};
