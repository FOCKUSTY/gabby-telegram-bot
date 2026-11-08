import type { Context } from "@/types";
import { UserService } from "@/services";
import { getUserId } from "@/utils";

import { ChooseTopicConversation } from "../conversations";
import { sendOrEdit } from "../utils";

const userService = new UserService();

export const start = async (context: Context) => {
  const id = getUserId(context.from);
  const topics = await userService.getUserTopics(id);
  if (topics.length === 0) {
    await userService.topic.createByContext(id, context);
    return sendOrEdit(
      context,
      "Вам бы создан топик, можете начинать общаться",
      {
        session: context.session,
      },
    );
  }

  const topic = await userService.getActiveTopic(id);
  if (!topic) {
    await context.conversation.enter(ChooseTopicConversation.name);
    return;
  }

  return sendOrEdit(
    context,
    "Топик открыт, сообщения пересылаются автоматически",
    {
      session: context.session,
    },
  );
};
