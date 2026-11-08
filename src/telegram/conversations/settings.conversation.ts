import type {
  UserConfiguration,
  Context,
  Conversation,
  MyConversation,
} from "@/types";
import { SettingsService } from "@/services";
import { getUserId } from "@/utils";
import {
  AVAILABLE_USER_CONFIGURATIONS,
  CALLBACK,
  USER_CONFIGURATION_TRANSFORMERS,
} from "../constants";
import { sendOrEdit } from "../utils";
import { configurationsKeyboard, settingsKeyboard } from "../keyboards";
import { registry } from "./handlers";

export class SettingsConversation implements Conversation {
  public constructor(
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

    const { data: settingsCallback, callbackContext } =
      await this.waitForCallback(
        conversation,
        CALLBACK.SETTINGS.CONFIGURATION.PREFIX,
      );

    if (settingsCallback === CALLBACK.SETTINGS.CONFIGURATION.USER.CANCEL) {
      return sendOrEdit(context, "Изменения настройки было отклонено", {
        keyboard: settingsKeyboard(),
        conversation,
      });
    }

    if (
      !settingsCallback ||
      settingsCallback === CALLBACK.SETTINGS.CONFIGURATION.USER.CHANGE_NICKNAME
    ) {
      await conversation.halt({ next: true });
      await registry.dispatch(callbackContext);
      return;
    }

    const [_p1, _p2, _p3, configuration, value] = settingsCallback.split(":");
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
  ): Promise<{ data: string | null; callbackContext: Context }> {
    const callbackContext = await conversation.waitFor("callback_query:data");
    await callbackContext.answerCallbackQuery().catch(() => undefined);

    const data = callbackContext.callbackQuery?.data ?? null;
    if (!data) return { data: null, callbackContext };
    if (data === CALLBACK.CANCEL) return { data: null, callbackContext };
    if (!data.startsWith(`${prefix}:`)) return { data: null, callbackContext };

    return { data, callbackContext };
  }
}
