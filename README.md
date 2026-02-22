# pinly

Project-local bookmarks stored as `.url` files under `.pinly/`. No tags, no groups — one pin = one title + URL. Pins live next to your code and can be git-tracked per project.

## PoC

- **Storage:** `<dir>/.pinly/*.url` (optional `--dir`, default: cwd)
- **Add:** `pinly add --title "<title>" <url>`
- **List:** Pins from current directory’s `.pinly/` **and** from each direct child directory’s `.pinly/` (one level; no deeper). Optional text filter. `--json` for machine output.
- **Open:** By list **id** or by **path** (e.g. `wiki.url` or `work-local/wiki.url` when listing from parent).

## Install globally

From the repo root (requires [Bun](https://bun.sh)):

```bash
cd /path/to/pinly
bun install
bun link
```

After that, `pinly` is on your PATH:

```bash
pinly add --title "Docs" https://example.com
pinly list
pinly open 1
```

To uninstall: `bun unlink pinly` (from anywhere).

## Run without global install

```bash
bun install
bun src/cli.ts <command> [options] [args]
```

## Commands

| Command | Description |
|--------|-------------|
| `add` | Add a pin. Requires `--title` and URL. Writes to `<dir>/.pinly/<slug>.url` (collision: `-2`, `-3`, …). |
| `list` | List pins from `<dir>/.pinly/` and from `<dir>/<child>/.pinly/` (direct children only). Optional `[query]` filter. `--json` for machine output. |
| `open` | Open a pin in default browser by **id** (from list) or by **path** (e.g. `docs.url` or `work-local/wiki.url`). |

## Options (global)

- `--dir`, `-d <path>` — Base directory (default: current directory). Pins are under `<path>/.pinly/` and `<path>/<child>/.pinly/`.
- `--help`, `-h` — Show help.

## Examples

```bash
pinly add --title "Bun" https://bun.sh
pinly add --dir ./my-app --title "API" https://api.example.com
pinly list
pinly list "api"
pinly open 1
pinly open docs.url
pinly open work-local/wiki.url   # scoped path when listing from parent
```

## .url format

Each pin is a standard `[InternetShortcut]` file with optional `TITLE=`:

```ini
[InternetShortcut]
URL=https://example.com
TITLE=My title
```

## Docs

- [Usage & behavior](docs/usage.md)
- [Design (PoC)](docs/design.md)

## Dependencies

- **Bun** — runtime
