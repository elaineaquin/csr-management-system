# 🛠 Project Setup & Useful Terminal Commands

## 🚀 Getting Started

Open the terminal in VS Code (Mac shortcut):

|           Action           | Shortcut (Mac) |
| :------------------------: | :------------: |
| Toggle Terminal in VS Code |     ⌘ + J      |

## 📁 If You Just Cloned the Repo

Run these commands in order:

```bash
pnpm install
pnpm dlx prisma generate
pnpm dlx prisma db push
pnpm dev
```

##### ⚠️ Make sure .env is configured before running these!

## 🧪 Running in Development

```bash
pnpm dev
```

## 🚀 Running in Production

```bash
pnpm build
pnpm start
```

## 🧬 Prisma Commands

```bash
pnpm dlx prisma generate
pnpm dlx prisma studio
```

💡 Notes

- Ensure your .env file is properly configured before running any database commands.

- Run pnpm dlx prisma generate whenever you update your schema.prisma.

- Use ctrl + C to stop any running command in the terminal.
