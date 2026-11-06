export const getIcon = (value: boolean) => {
  if (value === true) {
    return "✓";
  }

  return "✕";
};

export const iconInText = (text: string, value: boolean) => {
  return `${text} ${getIcon(value)}`;
};
