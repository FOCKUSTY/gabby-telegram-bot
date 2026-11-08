import { Context } from "@/types";
import { CALLBACK } from "@/telegram/constants";

import { BaseMatchHandler } from "./base-handler";
import { RenameTopicConversation } from "../rename-topic.conversation";
import { ChooseTopicConversation } from "../choose-topic.conversation";
import { CreateTopicConversation } from "../create-topic.conversation";

export class TopicSettingsHandler extends BaseMatchHandler {
  public verify(data: string): boolean {
    const prefix = this.extractCallback(data).slice(0, 2).join(":");
    return prefix === CALLBACK.TOPIC.SETTINGS.PREFIX;
  }

  public async handle(context: Context): Promise<unknown> {
    const { data } = this.extract(context);
    const [_p1, _p2, type] = data.split(":");

    if (type === "rename") {
      return context.conversation.enter(RenameTopicConversation.name);
    }

    if (type === "choose") {
      return context.conversation.enter(ChooseTopicConversation.name);
    }

    if (type === "create") {
      return context.conversation.enter(CreateTopicConversation.name);
    }

    return context.answerCallbackQuery("Unknown action");
  }
}
