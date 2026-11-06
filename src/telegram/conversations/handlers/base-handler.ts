import type {
  CallbackHandlerModule,
  CallbackMatcher,
  Context,
  MyConversation,
  SessionData,
} from "@/types";
import type { CallbackRegister } from "./handler-register";
import { InlineKeyboard } from "grammy";

import { sendOrEdit } from "@/telegram/utils";
import { getUserId } from "@/utils";

export abstract class BaseHandler implements CallbackHandlerModule {
  public constructor(protected readonly registry: CallbackRegister) {}

  public abstract execute(): void;

  protected extract(context: Context) {
    const data = context.callbackQuery?.data;
    if (!data) {
      throw new Error("callbackQuery.data is not defined");
    }

    const id = getUserId(context.from);

    return {
      data,
      id,
    };
  }

  protected reply(
    context: Context,
    text: string,
    data: {
      keyboard?: InlineKeyboard;
      session?: SessionData;
      conversation?: MyConversation;
    },
  ) {
    return sendOrEdit(context, text, data);
  }
}

export abstract class BaseMatchHandler
  extends BaseHandler
  implements CallbackMatcher, CallbackHandlerModule
{
  public abstract verify(data: string): boolean;
  public abstract handle(context: Context): Promise<unknown>;

  public execute(): void {
    this.registry.matcher(this);
  }

  protected extractCallback(data: string): [string, ...string[]] {
    const [prefix, ...other] = data.split(":");
    return [prefix, ...other];
  }
}

export abstract class BaseVerifyHandler
  extends BaseMatchHandler
  implements CallbackMatcher, CallbackHandlerModule
{
  public constructor(
    private readonly prefix: string,
    registry: CallbackRegister,
  ) {
    super(registry);
  }

  public verify(data: string): boolean {
    const [prefix] = this.extractCallback(data);
    return prefix === this.prefix;
  }
}
