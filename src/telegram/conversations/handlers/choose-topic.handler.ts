import type { Context } from "@/types";

import { BaseVerifyHandler } from "./base-handler";
import { CallbackRegister } from "./handler-register";

import { mainMenuKeyboard } from "@/telegram/keyboards";
import { CALLBACK } from "@/telegram/constants";
import { UserService } from "@/services";

export class ChooseTopicHandler extends BaseVerifyHandler {
  private readonly userService = new UserService();

  public constructor(registry: CallbackRegister) {
    super(CALLBACK.CHOOSE_TOPIC.PREFIX, registry);
  }

  public async handle(context: Context): Promise<unknown> {
    const { data, id } = this.extract(context);
    const [_prefix, topicId] = data.split(":");

    const topic = await this.userService.toggleTopicActive(id, topicId, true);

    await context.answerCallbackQuery("Топик выбран");
    return this.reply(
      context,
      `Выбран топик ${topic.topic.nameForUser ?? topic.topicId}`,
      {
        keyboard: mainMenuKeyboard(),
      },
    );
  }
}
