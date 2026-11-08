# Gabby Telegram Bot

> Анонимный мессенджер-мост между пользователями и администрацией через форум-топики Telegram.

Бот превращает личные сообщения пользователей в сообщения внутри супергруппы с включёнными топиками. Каждому пользователю создаётся отдельный топик — ответы из него пересылаются обратно пользователю. Собеседники видят только псевдоним, без @username и ID.

## Возможности

- 🎯 Персональный топик для каждого пользователя
- 🔁 Двусторонняя пересылка сообщений (ЛС ⇄ топик)
- 🔀 Несколько топиков на пользователя и переключение между ними
- ⏯ Включение/выключение пересылки (`/open`, `/close`)
- ✏️ Синхронизация редактирования сообщений
- 👍 Синхронизация реакций (`message_reaction`)
- 🏷 Переименование топика
- 🩺 HTTP health-check (`GET /ping`)
- ⚡ Кэш с TTL и декораторами `@Cached` / `@CacheInvalidate`
- 🐳 Docker Compose с PostgreSQL «из коробки»

## Стек

- **TypeScript** (strict) + `ts-node`
- **[grammY](https://grammy.dev)** + `@grammyjs/conversations`
- **Prisma** + PostgreSQL через `@prisma/adapter-pg`
- **Express** (health-check)
- **pnpm** + **Docker Compose**

## Как это работает

```
  Telegram DM                    Supergroup (forum)
 ┌──────────────┐               ┌───────────────────┐
 │ User → Bot   │ ───forward──► │  Topic #user_id   │
 │ Bot  → User  │ ◄──forward─── │  Admin / other    │
 └──────────────┘               └───────────────────┘
```

- `MessageEvent` (`:text`) — пересылает текст ЛС → топик и обратно
- `EditEvent` (`edit`) — синхронизирует редактирование
- `ReactEvent` (`message_reaction`) — синхронизирует реакции
- Соответствие `message_id` между чатами хранится в
  `BaseUserInteractionEvent.MESSAGES_CONTEXT` (in-memory)

## Требования

- Node.js `>= 22`
- pnpm `>= 12`
- PostgreSQL 16 (локально или через Docker)

## Установка

```bash
git clone <repo-url>
cd gabby-telegram-bot
pnpm install
cp .env.example .env
```

Заполнить `.env`:

| Переменная                | Назначение                                        |
| ------------------------- | ------------------------------------------------- |
| `DATABASE_URL`            | Строка подключения к PostgreSQL                   |
| `TELEGRAM_BOT_TOKEN`      | Токен от [@BotFather](https://t.me/BotFather)     |
| `BOT_CREATOR_ID`          | Telegram ID владельца бота                        |
| `SUPER_GROUP_TELEGRAM_ID` | ID супергруппы с включёнными топиками             |
| `PRISMA_CONNECTION_TYPE`  | `adapter` (по умолчанию) или пусто для Accelerate |
| `PORT`                    | Порт HTTP-сервера (health-check)                  |

Бота нужно добавить в супергруппу **администратором** с правом _Manage Topics_ — иначе `createForumTopic` упадёт.

## Запуск

### Локально (PostgreSQL в Docker)

```bash
docker compose up -d postgres
npx prisma migrate deploy --schema ./src/database/schema.prisma
pnpm dev
```

### Полностью в Docker

```bash
docker compose up --build
```

Контейнер сам применяет миграции (`prisma migrate deploy`) перед стартом.

## Скрипты

| Скрипт                      | Что делает                                |
| --------------------------- | ----------------------------------------- |
| `pnpm dev`                  | Запуск через `ts-node` с `tsconfig-paths` |
| `npx prisma generate`       | Генерация Prisma-клиента                  |
| `npx prisma migrate dev`    | Новая миграция                            |
| `npx prisma migrate deploy` | Применение миграций                       |

## Команды бота

| Команда     | Описание                                                   |
| ----------- | ---------------------------------------------------------- |
| `/start`    | Запуск, создание первого топика или открытие существующего |
| `/settings` | Настройки пользователя                                     |
| `/open`     | Включить пересылку                                         |
| `/close`    | Выключить пересылку                                        |
| `/about`    | Справка о боте                                             |

## Структура проекта

```
src/
├── app.ts                  # HTTP-сервер (health-check)
├── env.ts                  # Валидация env через fenviee
├── index.ts                # Заглушка точки входа
├── cache/                  # BaseCache, MemoryCache, storages
├── constants/              # Общие константы (время, кэш)
├── database/               # Prisma-клиент, schema.prisma, миграции
│   └── generated/          # Автогенерируемый клиент Prisma
├── decorators/             # @Cached и @CacheInvalidate
├── services/               # User / Topic / Settings
├── telegram/
│   ├── bot.ts              # grammY: session, conversations, handlers
│   ├── commands/           # /start, /settings, /open, /close, /about
│   ├── conversations/      # Сценарии + CallbackRegister handlers
│   ├── events/             # message / edit / react
│   ├── keyboards/          # InlineKeyboard-хелперы
│   ├── constants/          # CALLBACK, PARSE_MODE, ...
│   └── utils/              # sendOrEdit, StringBuilder, extract, getIcon
├── types/                  # Общие типы (Telegram, Prisma, Cache, ...)
└── utils/                  # getUserId, fti
```

## Схема БД

- `User` — `telegramId`, `nickname`, связь с `Admin`
- `UserSettings` — флаги (`sendEnabled`)
- `Topic` — топик в супергруппе, `telegramId = message_thread_id`
- `UserTopic` — User ⇄ Topic + флаг `active`
- `Admin` / `AdminTopic` — администраторы и их топики

## Разработка

Проект активно использует декораторы:

```ts
@Cached({ ttlMs: 5 * MS_PER_MINUTE, maxOperations: 100 })
public async findOrCreate(telegramId: TelegramId) { ... }

@CacheInvalidate({
  keysOf: ([id]) => [`UserService:findOrCreate:${id}`],
})
public async update(...) { ... }
```

Кэш по умолчанию in-memory. Для файлового кэша:

```ts
new MemoryCache("section-name"); // → ./cache/section-name.cache.json
```

## Известные ограничения

- `sendOrEdit` **не** устанавливает `parse_mode` — если нужен HTML из `StringBuilder`,
  раскомментируйте `parse_mode: PARSE_MODE` в `src/telegram/utils/send-or-edit.ts`.
- Соответствие `message_id` (`dmToTm` / `tmToDm`) хранится в памяти и теряется при перезапуске.
- `PRISMA_CONNECTION_TYPE=adapter` обязателен при локальном запуске (Accelerate — только при явной настройке).

## Лицензия

[MIT](./LICENSE) © FOCKUSTY
