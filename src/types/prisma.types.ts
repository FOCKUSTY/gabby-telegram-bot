import type {
  Topic,
  User,
  UserSettings,
  UserTopic,
} from "@/database/generated/client";

export type UserTopicWithTopic = UserTopic & {
  topic: Topic;
  user: {
    telegramId: string;
  };
};

export type UserWithUserTopic = User & {
  userTopics: UserTopicWithTopic[];
};

export type UserWithUserSettings = User & {
  settings: UserSettings | null;
};

export type BaseUserTopic = UserTopicWithTopic;
export type BaseUser = UserWithUserTopic & UserWithUserSettings;
