import type {
  UserConfiguration,
  Context,
  Conversation,
  MyConversation,
} from "@/types";
import { SettingsService, UserService } from "@/services";
import { getUserId } from "@/utils";
import {
  AVAILABLE_USER_CONFIGURATIONS,
  CALLBACK,
  USER_CONFIGURATION_TRANSFORMERS,
} from "../constants";
import { sendOrEdit } from "../utils";
import { configurationsKeyboard, settingsKeyboard } from "../keyboards";

export class SettingsConversation implements Conversation {
  public constructor(
    private readonly user: UserService = new UserService(),
    private readonly settings: SettingsService = new SettingsService(),
  ) {}

  public async execute(
    conversation: MyConversation,
    context: Context,
  ): Promise<void> {
    const id = getUserId(context.from);
    const settings = await this.settings.findOrCreate(id);
    await sendOrEdit(context, "Настройки", {
      conversation,
      keyboard: configurationsKeyboard(settings),
    });

    const settingsCallback = await this.waitForCallback(
      conversation,
      CALLBACK.SETTINGS.CONFIGURATION.PREFIX,
    );
    if (!settingsCallback) {
      return sendOrEdit(context, "Изменения настройки было отклонено", {
        keyboard: settingsKeyboard(),
        conversation,
      });
    }

    const [_p1, _p2, configuration, value] = settingsCallback.split(":");
    const configurationValid = this.validateConfiguration(configuration);
    if (!configurationValid) {
      throw new Error("...");
    }

    const newValue = this.transformConfiguration(
      configuration as UserConfiguration,
      value,
    );
    const updatedSettings = await this.settings.update(
      settings.id,
      configuration as UserConfiguration,
      newValue,
    );
    await sendOrEdit(context, "Настройки", {
      conversation,
      keyboard: configurationsKeyboard(updatedSettings),
    });
  }

  private transformConfiguration(
    configuration: UserConfiguration,
    value: string,
  ) {
    return USER_CONFIGURATION_TRANSFORMERS[configuration](value);
  }

  private validateConfiguration(configuration: string) {
    return (AVAILABLE_USER_CONFIGURATIONS as readonly string[]).includes(
      configuration,
    );
  }

  private async waitForCallback(
    conversation: MyConversation,
    prefix: string,
  ): Promise<string | null> {
    const callbackContext = await conversation.waitFor("callback_query:data");
    await callbackContext.answerCallbackQuery().catch(() => undefined);

    const data = callbackContext.callbackQuery?.data ?? null;
    if (!data) return null;
    if (data === CALLBACK.SETTINGS.CONFIGURATION.USER.CANCEL) return null;
    if (!data.startsWith(`${prefix}:`)) return null;

    return data;
  }
}
