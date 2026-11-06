import type { Context } from "@/types";
import { CALLBACK } from "@/telegram/constants";
import { BaseMatchHandler } from "./base-handler";
import { SettingsConversation } from "../settings.conversation";
import { RenameTopicConversation } from "../rename-topic.conversation";

export class SettingsHandler extends BaseMatchHandler {
  public verify(data: string): boolean {
    const prefix = this.extractCallback(data).slice(0, 2).join(":");
    return prefix === CALLBACK.SETTINGS.CONFIGURATION.PREFIX;
  }

  public async handle(context: Context): Promise<unknown> {
    const { data } = this.extract(context);
    return this.enter(data, context);
  }

  private async enter(data: string, context: Context) {
    const methods = [this.enterUser, this.enterTopic];

    for (const method of methods) {
      const resolved = await method.call(this, data, context);
      if (resolved) {
        break;
      }
    }
  }

  private async enterUser(data: string, context: Context) {
    if (data !== CALLBACK.SETTINGS.CONFIGURATION.USER.ENTER) {
      return false;
    }

    await context.conversation.enter(SettingsConversation.name);
    return true;
  }

  private async enterTopic(data: string, context: Context) {
    if (data !== CALLBACK.SETTINGS.CONFIGURATION.TOPIC.ENTER) {
      return false;
    }

    await context.conversation.enter(RenameTopicConversation.name);
    return true;
  }
}
