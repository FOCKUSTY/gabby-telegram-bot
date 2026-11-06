import { Context } from "@/types";

export const getUserId = (from: Context["from"]) => {
  const id = from?.id;
  if (!id) {
    throw new Error("Id is not defined");
  }

  return id;
};
