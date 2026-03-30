# ref-bot

A Discord bot that provides real-time status information for amateur radio reflectors. Supports reflectors running [mfiscus](https://github.com/mfiscus)'s URFD [API](https://github.com/mfiscus/urfd-docker/blob/main/custom/var/www/urfd/json) or the default MREFD API bundled with [KC1AWV](https://github.com/kc1awv)'s [gomrefdash](https://github.com/kc1awv/gomrefdash).

## Commands

| Command | Description |
|---------|-------------|
| `/status` | Reflector operational status and uptime |
| `/lastheard` | Last 5 stations heard on the reflector |
| `/peers` | Interlinked peer reflectors |
| `/links` | Repeaters currently linked to the reflector |

All responses are ephemeral (visible only to the user who ran the command).

## Prerequisites

- A Discord application and bot token — create one at [discord.com/developers](https://discord.com/developers/applications)
- A running URF or MREF reflector with a compatible JSON API
- Node.js 22+ (for local deployment) or Docker

## Configuration

Copy `config.json-example` to `config.json` and fill in your values:

```json
{
    "token": "your-bot-token",
    "clientId": "your-application-id",
    "guildId": "your-server-id",
    "icon": "https://example.com/your-icon.png",
    "url": "https://your-reflector-dashboard-url"
}
```

| Field | Description |
|-------|-------------|
| `token` | Discord bot token (from the Bot section of your application) |
| `clientId` | Discord application ID (from General Information) |
| `guildId` | Discord server ID (right-click your server → Copy Server ID) |
| `icon` | URL to an image used as the embed author icon |
| `url` | Base URL of your reflector dashboard (no trailing slash) |

## Deployment

### Docker (recommended)

```yaml
services:
  ref-bot:
    image: mfiscus/ref-bot:latest
    container_name: ref-bot
    volumes:
      - /opt/ref-bot:/config
    restart: unless-stopped
```

Place your `config.json` at `/opt/ref-bot/config.json` on the host, then:

```bash
docker compose up -d
```

### Local

```bash
npm install
node deploy-commands.js   # register slash commands with Discord (run once)
node index.js
```

> **Note:** `deploy-commands.js` only needs to be run when adding or changing slash commands.

## Development

```bash
npm install
npx eslint .        # lint
npm test            # run tests
node index.js       # run
```

## Testing

Tests are written with [Jest](https://jestjs.io/) and live in the `tests/` directory:

| Path | Type | What it covers |
|------|------|----------------|
| `tests/unit/utils.test.js` | Unit | Utility functions (`pluralize`, `timeSinceDate`, `timeSinceSeconds`) |
| `tests/integration/commands/*.test.js` | Integration | Each slash command (`status`, `lastheard`, `peers`, `links`) |

The integration tests mock `undici` (HTTP requests) and `discord.js` so no live reflector or Discord connection is needed.

```bash
npm test                        # run all tests
npx jest tests/unit             # unit tests only
npx jest tests/integration      # integration tests only
npx jest --coverage             # with coverage report
```

## Docker Hub

Pre-built multi-architecture images (`linux/amd64`, `linux/arm64`) are published automatically to [hub.docker.com/r/mfiscus/ref-bot](https://hub.docker.com/r/mfiscus/ref-bot) on every push to `main`, on tagged releases, and on a monthly schedule to pick up base image updates.

## License

[GPL-3.0-or-later](LICENSE)
