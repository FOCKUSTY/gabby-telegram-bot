export const CALLBACK = {
  CANCEL: "cancel",
  MAIN_MENU: "main_menu",

  CHOOSE_TOPIC: {
    PREFIX: "choose_topic",
    CLOSE: "choose_topic:close",
  },

  TOPIC: {
    PREFIX: "topic",
    SETTINGS: {
      PREFIX: "topic:settings",
      RENAME: "topic:settings:rename",
      CHANGE: "topic:settings:choose",
      CREATE: "topic:settings:create",
      ENTER: "settings:configuration:topic:enter",
    },
  },

  SETTINGS: {
    PREFIX: "settings",
    ENTER: "settings:enter",

    CONFIGURATION: {
      PREFIX: "settings:configuration",

      USER: {
        PREFIX: "settings:configuration:user",
        ENTER: "settings:configuration:user:enter",
        CANCEL: "settings:configuration:user:cancel",
        CHANGE: (configuration: string, value: string) => {
          return `settings:configuration:user:${configuration}:${value}`;
        },
      },
      TOPIC: {
        PREFIX: "settings:configuration:topic",
        ENTER: "settings:configuration:topic:enter",
        CANCEL: "settings:configuration:topic:cancel",
        CHANGE: (configuration: string, value: string) => {
          return `settings:configuration:topic:${configuration}:${value}`;
        },
      },
    },
  },
} as const;
