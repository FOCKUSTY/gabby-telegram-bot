import { CALLBACK } from "@/telegram/constants";
import { BaseHandler } from "./base-handler";

import { ChooseTopicConversation } from "../choose-topic.conversation";
import { sendOrEdit } from "@/telegram/utils";
import { mainMenuKeyboard, settingsKeyboard } from "@/telegram/keyboards";

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
    this.registry.exact(CALLBACK.TOPIC.ENTER, async () => {
      // ...
    });

    this.registry.exact(CALLBACK.TOPIC.RENAME, async () => {
      // ...
    });

    this.registry.exact(CALLBACK.TOPIC.CHANGE, async (context) => {
      await context.conversation.enter(ChooseTopicConversation.name);
      await context.answerCallbackQuery();
    });
  }

  private registerSettingsActions() {
    this.registry.exact(CALLBACK.SETTINGS.ENTER, async (context) => {
      await sendOrEdit(context, "Настройки", {
        keyboard: settingsKeyboard(),
        session: context.session,
      });
    });
  }
}
