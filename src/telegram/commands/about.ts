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
  .code("/start")
  .appendLine(" — запуск бота")
  .code("/settings")
  .appendLine(" — настройки")
  .code("/open")
  .appendLine(" — включить пересылку")
  .code("/close")
  .appendLine(" — выключить пересылку")
  .code("/about")
  .appendLine(" — эта справка")
  .newLine()
  .italic("MIT © FOCKUSTY")
  .toString();

/**
 * /about — краткая справка по боту.
 *
 * Замечание: `StringBuilder` формирует HTML-разметку,
 * поэтому в `sendOrEdit` должен быть включён `parse_mode: "HTML"`
 * (см. `src/telegram/utils/send-or-edit.ts`).
 */
export const about = async (context: Context) => {
  return sendOrEdit(context, text, { session: context.session });
};
