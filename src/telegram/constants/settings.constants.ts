export const AVAILABLE_USER_CONFIGURATIONS = ["sendEnabled"] as const;

export const USER_CONFIGURATION_TRANSFORMERS = {
  sendEnabled: (value: string) => value === "true",
};

export const AVAILABLE_TOPIC_CONFIGURATIONS = ["name"] as const;

export const TOPIC_CONFIGURATION_TRANSFORMERS = {
  name: (value: string) => {
    const name = value.trim();
    if (name.length < 3 || name.length > 20) {
      return null;
    }

    return name;
  },
};
