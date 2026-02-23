# pinly

Project-local bookmarks stored as `.url` files under `.pinly/`. No tags, no groups — one pin = one title + URL. Pins live next to your code and can be git-tracked per project.

## PoC

- **Storage:** `<dir>/.pinly/*.url` (optional `--dir`, default: cwd)
- **Add:** `pinly add --title "<title>" <url>` or `pinly add --title "<title>" --from-clipboard` (URL from clipboard)
- **Ls:** List pins (`pinly ls`; alias `list`). URLs truncated in table; `pinly ls <id>` for full details. Optional text filter. `--json` for machine output.
- **Open:** Open a pin by **id** or **path** (e.g. `docs.url` or `my-project/docs.url` when listing from parent).
- **Rm:** Remove a pin by **id** or **path** (`pinly rm 1`, `pinly rm docs.url`).
- **Cp:** Copy a pin’s URL to clipboard by **id** or **path** (`pinly cp 1`).
- **Cleanup:** Remove all `.pinly` directories under the base dir (with confirmation; use `--force` to skip).
- **TUI:** Dashboard (`pinly tui`): list pins, ↑/↓ navigate, Enter open, q quit. Uses [Rezi](https://rezitui.dev).

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
pinly ls
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
| `add` | Add a pin. Requires `--title` and URL (or `--from-clipboard` / `-c` to use clipboard). Writes to `<dir>/.pinly/<slug>.url` (collision: `-2`, `-3`, …). |
| `ls` | List pins (alias: `list`). URLs truncated; `pinly ls <id>` for full details. Optional `[query]` filter. `--json` for machine output. |
| `open` | Open a pin in default browser by **id** or **path** (e.g. `docs.url` or `my-project/docs.url`). |
| `rm` | Remove a pin by **id** or **path** (e.g. `pinly rm 1`, `pinly rm docs.url`). |
| `cp` | Copy pin URL to clipboard by **id** or **path** (e.g. `pinly cp 1`). |
| `cleanup` | Remove all `.pinly` dirs under base (prompts for confirmation; `--force` to skip). |
| `tui` | Dashboard TUI: list pins, ↑/↓ navigate, Enter open, q quit. Optional `--dir`. |

## Options (global)

- `--dir`, `-d <path>` — Base directory (default: current directory). Pins are under `<path>/.pinly/` and `<path>/<child>/.pinly/`.
- `--help`, `-h` — Show help.

## Examples

```bash
pinly add --title "Bun" https://bun.sh
pinly add --dir ./my-app --title "API" https://api.example.com
pinly ls
pinly ls 1
pinly ls "api"
pinly open 1
pinly cp 1
pinly rm 1
pinly rm docs.url
pinly cleanup
pinly cleanup --force
pinly tui
pinly tui --dir ./my-app
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
- **TUI:** `@rezi-ui/core`, `@rezi-ui/node` (Rezi). Requires a terminal with 256-color or true-color support. If you see `engine_create` errors, try running in a real TTY or check [Rezi docs](https://rezitui.dev/docs/getting-started/install).
