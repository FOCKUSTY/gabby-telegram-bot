import { SettingsService, UserService } from "@/services";
import { Context } from "@/types";
import { getUserId } from "@/utils";

const userService = new UserService();
const settingsService = new SettingsService();

const toggle = async (context: Context, value: boolean) => {
  const id = getUserId(context.from);
  const updated = await userService.updateUserSettings(
    id,
    "sendEnabled",
    value,
  );
  if (updated.sendEnabled === value) {
    return context.reply(
      `Настройка отправки ${value ? "в" : "вы"}ключена, топик \"${value ? "открыт" : "закрыт"}\"`,
    );
  }

  return context.reply("Произошла ошибка, попробуйте позже");
};

export const close = async (context: Context) => {
  return toggle(context, false);
};

export const open = async (context: Context) => {
  return toggle(context, true);
};
