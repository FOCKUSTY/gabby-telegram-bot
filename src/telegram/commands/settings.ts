import { Context } from "@/types";
import { sendOrEdit } from "../utils";
import { settingsKeyboard } from "../keyboards";

export const settings = async (context: Context) => {
  await sendOrEdit(context, "Настройки", {
    keyboard: settingsKeyboard(),
    session: context.session,
  });
};
