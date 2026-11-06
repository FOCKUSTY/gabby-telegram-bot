import {
  AVAILABLE_TOPIC_CONFIGURATIONS,
  AVAILABLE_USER_CONFIGURATIONS,
} from "@/telegram/constants";

export type UserConfiguration = (typeof AVAILABLE_USER_CONFIGURATIONS)[number];
export type TopicConfiguration =
  (typeof AVAILABLE_TOPIC_CONFIGURATIONS)[number];
