import type { Topic, User, UserTopic } from "@/database/generated/client";

export type UserTopicWithTopic = UserTopic & {
  topic: Topic;
  user: {
    telegramId: string;
  };
};

export type UserWithUserTopic = User & {
  userTopics: UserTopicWithTopic[];
};

export type BaseUserTopic = UserTopicWithTopic;
export type BaseUser = UserWithUserTopic;
