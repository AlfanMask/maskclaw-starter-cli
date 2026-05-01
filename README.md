# MaskClaw Starter CLI

A simple provisioning CLI for creating and wiring OpenClaw agents quickly.

This project helps you:
- scaffold a new agent workspace
- register the agent in OpenClaw
- copy authentication from an existing agent
- connect the agent to a Telegram bot
- optionally hide or reset Telegram bot commands

## Why this exists

When you want to create many customer-specific agents, doing everything manually gets repetitive.

MaskClaw Starter CLI turns that into a small repeatable flow.

## Current flow

In practice, the setup is usually just **2 steps**.

### Step 1 — Create the Telegram bot

Create a new bot with **BotFather** on Telegram.

You only need:
- bot username
- bot token

If you want the bot to look fresh and chat-only, you can reset/hide its command menu during connection.

### Step 2 — Provision the OpenClaw agent

Run one command to:
- create the agent scaffold
- register it in OpenClaw
- copy auth from the main agent
- connect the Telegram bot
- hide Telegram commands

Example:

```bash
node bin/maskclaw-agent.js new toko-yaya \
  --name "Elin" \
  --owner "Yaya" \
  --persona "friendly, clear, and fast" \
  --emoji "🌸" \
  --register \
  --copy-auth \
  --telegram-account toko-yaya-bot \
  --telegram-token 123456789:ABCDEF \
  --telegram-hide-commands
```

That is usually enough for a fresh customer bot.

## Full setup summary

### Minimal customer onboarding

1. Create a new Telegram bot in BotFather
2. Run the `new` command with:
   - `--register`
   - `--copy-auth`
   - `--telegram-account`
   - `--telegram-token`
   - `--telegram-hide-commands`

## Commands

### Create a new agent

```bash
node bin/maskclaw-agent.js new <agentId> [options]
```

Useful options:
- `--name`
- `--owner`
- `--persona`
- `--emoji`
- `--register`
- `--copy-auth`
- `--auth-from`
- `--telegram-account`
- `--telegram-token`
- `--telegram-hide-commands`
- `--telegram-commands`

### Register an existing scaffolded agent

```bash
node bin/maskclaw-agent.js register <agentId>
```

### Copy auth from another agent

```bash
node bin/maskclaw-agent.js copy-auth <agentId> --from main
```

### Connect an agent to Telegram

```bash
node bin/maskclaw-agent.js connect-telegram <agentId> \
  --account <accountId> \
  --token <telegramBotToken> \
  --hide-commands
```

### Show available presets and addons

```bash
node bin/maskclaw-agent.js list-templates
```

## Telegram bot notes

### Hide all Telegram commands

This makes the bot feel cleaner for end users.

```bash
node bin/maskclaw-agent.js connect-telegram my-agent \
  --account my-bot \
  --token 123456:ABCDEF \
  --hide-commands
```

### Set only selected Telegram commands

```bash
node bin/maskclaw-agent.js connect-telegram my-agent \
  --account my-bot \
  --token 123456:ABCDEF \
  --commands "help:Get support,status:Check status"
```

## Suggested default workflow

For most new customer bots:
- create bot in BotFather
- run `new` with `--register --copy-auth --telegram-account --telegram-token --telegram-hide-commands`

That gives you a fresh bot with minimal menu clutter.

## Notes

- Authentication is currently copied from an existing OpenClaw agent, usually `main`.
- Telegram bot token is sensitive. Avoid exposing it in screenshots, shared terminal logs, or public repos.
- This project is currently optimized for fast internal provisioning.

## Future ideas

- addon installer (for example `gog`)
- one-command customer bundles
- safer token input via prompt or env vars
- richer workspace templates
