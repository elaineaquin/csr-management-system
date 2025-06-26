# 🛠 Project Setup & Useful Terminal Commands

## 🚀 Getting Started

Open the terminal in VS Code (Mac shortcut):

|           Action           | Shortcut (Mac) |
| :------------------------: | :------------: |
| Toggle Terminal in VS Code |     ⌘ + J      |

## 📁 If You Just Cloned the Repo

Run these commands in order:

```bash
pnpm install                   # Install dependencies
pnpm dlx prisma generate       # Generate the Prisma client
pnpm dlx prisma db push        # Push schema to the database
pnpm dev                       # Start the development server
```

##### ⚠️ Make sure .env is configured before running these!

## 🧪 Running in Development

```bash
pnpm dev                       # Starts the Next.js dev server (with hot reload)
```

## 🚀 Running in Production

```bash
pnpm build                     # Compile the app for production
pnpm start                     # Start the production server
```

## 🧬 Prisma Commands

```bash
pnpm dlx prisma generate
pnpm dlx prisma studio # view and have write access on database directly
```

💡 Notes

- Ensure your .env file is properly configured before running any database commands.

- Run pnpm dlx prisma generate whenever you update your schema.prisma.

- Use ctrl + C to stop any running command in the terminal.
