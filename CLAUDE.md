# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ref-bot** is a Discord bot (Node.js + discord.js v14) that queries amateur radio reflector APIs (URF/MREF) and displays status information as formatted Discord embeds via slash commands.

## Commands

```bash
# Install dependencies
npm install

# Run locally
node index.js

# Register/update slash commands with Discord API (required after adding/changing commands)
node deploy-commands.js

# Lint
npx eslint .

# Docker
docker-compose up -d
```

There are no automated tests.

## Architecture

**Entry point**: `index.js` — loads all commands from `commands/` dynamically, handles Discord interactions, enforces a cooldown system (3s default, 10s for reflector commands).

**Command structure** (`commands/reflector/`): Each command exports a `data` property (SlashCommandBuilder) and an `execute(interaction)` function. Commands use `undici.request()` to call the configured reflector's REST API endpoints (`/json/status`, `/json/metadata`, `/json/stations`, `/json/peers`, `/json/links`) and reply with EmbedBuilder formatted messages. All replies are ephemeral.

**Data flow**: Discord slash command → `index.js` interaction handler → command lookup → HTTP request to reflector API → parse JSON → format Discord embed → ephemeral reply.

**Events** (`events/`): `ready.js` and `interactionCreate.js` exist but contain duplicate/minimal logic — the primary interaction handling lives in `index.js`.

## Configuration

Copy `config.json-example` to `config.json` (gitignored):

```json
{
    "token": "",       // Discord bot token
    "clientId": "",    // Discord application ID
    "guildId": "",     // Discord server/guild ID
    "icon": "",        // Embed icon URL
    "url": ""          // Reflector API base URL (e.g. https://reflector.example.com)
}
```

For Docker, `config.json` is stored at `/opt/ref-bot/config.json` on the host and symlinked into the container.

## Adding a New Command

1. Create a file in `commands/reflector/` exporting `data` (SlashCommandBuilder) and `execute`.
2. Run `node deploy-commands.js` to register it with Discord.
3. The command is auto-loaded by `index.js` on startup — no other wiring needed.

## Code Style

ESLint enforces: tabs for indentation, single quotes, stroustrup brace style, max 4 nested callbacks. Run `npx eslint .` before committing.
