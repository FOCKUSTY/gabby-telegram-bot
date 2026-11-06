import type { Context, Conversation, MyConversation } from "@/types";
import { UserService } from "@/services";

export class TopicChatConversation implements Conversation {
  public constructor(private user: UserService = new UserService()) {}

  public async execute(
    conversation: MyConversation,
    context: Context,
  ): Promise<void> {}
}
