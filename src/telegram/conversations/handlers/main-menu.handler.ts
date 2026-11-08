import { CALLBACK } from "@/telegram/constants";
import { BaseHandler } from "./base-handler";

import { ChooseTopicConversation } from "../choose-topic.conversation";
import { sendOrEdit } from "@/telegram/utils";
import { mainMenuKeyboard, settingsKeyboard } from "@/telegram/keyboards";
import { RenameTopicConversation } from "../rename-topic.conversation";
import { topicSettingsKeyboard } from "@/telegram/keyboards/topic-settings.keyboard";
import { ChangeNicknameConversation } from "../change-nickname.conversation";

export class MainMenuHandler extends BaseHandler {
  public execute(): void {
    this.registerEnter();
    this.registerTopicActions();
    this.registerSettingsActions();
  }

  private registerEnter() {
    this.registry.exact(CALLBACK.MAIN_MENU, async (context) => {
      await sendOrEdit(context, "Главное меню", {
        keyboard: mainMenuKeyboard(),
      });
      await context.answerCallbackQuery();
    });
  }

  private registerTopicActions() {
    this.registry.exact(CALLBACK.TOPIC.SETTINGS.ENTER, async (context) => {
      await sendOrEdit(context, "Настройки топика", {
        keyboard: topicSettingsKeyboard(),
      });
      await context.answerCallbackQuery();
    });

    this.registry.exact(CALLBACK.TOPIC.SETTINGS.RENAME, async (context) => {
      await context.conversation.enter(RenameTopicConversation.name);
      await context.answerCallbackQuery();
    });

    this.registry.exact(CALLBACK.TOPIC.SETTINGS.CHANGE, async (context) => {
      await context.conversation.enter(ChooseTopicConversation.name);
      await context.answerCallbackQuery();
    });
  }

  private registerSettingsActions() {
    this.registry.exact(
      CALLBACK.SETTINGS.CONFIGURATION.USER.CHANGE_NICKNAME,
      async (context) => {
        await context.conversation.enter(ChangeNicknameConversation.name);
        await context.answerCallbackQuery();
      },
    );

    this.registry.exact(CALLBACK.SETTINGS.ENTER, async (context) => {
      await sendOrEdit(context, "Настройки", {
        keyboard: settingsKeyboard(),
        session: context.session,
      });
    });
  }
}
