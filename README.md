# pinly

Project-local bookmarks stored as `.url` files under `.pinly/`. No tags, no groups — one pin = one title + URL. Pins live next to your code and can be git-tracked per project.

## PoC

- **Storage:** `<dir>/.pinly/*.url` (optional `--dir`, default: cwd)
- **Add:** `pinly add --title "<title>" <url>` or `pinly add --title "<title>" --from-clipboard` (URL from clipboard)
- **List:** Pins from current directory’s `.pinly/` **and** from each direct child’s `.pinly/`. URLs truncated in table; use `pinly list <id>` for full details. Optional text filter. `--json` for machine output.
- **Open:** By list **id** or by **path** (e.g. `wiki.url` or `work-local/wiki.url` when listing from parent).
- **Rm:** Remove a pin by **id** or **path** (`pinly rm 1`, `pinly rm ess.url`).

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
| `add` | Add a pin. Requires `--title` and URL (or `--from-clipboard` / `-c` to use clipboard). Writes to `<dir>/.pinly/<slug>.url` (collision: `-2`, `-3`, …). |
| `list` | List pins (URLs truncated). `pinly list <id>` shows full details for one pin. Optional `[query]` filter. `--json` for machine output. |
| `open` | Open a pin in default browser by **id** (from list) or by **path** (e.g. `docs.url` or `work-local/wiki.url`). |
| `rm` | Remove a pin by **id** or **path** (e.g. `pinly rm 1`, `pinly rm ess.url`). |

## Options (global)

- `--dir`, `-d <path>` — Base directory (default: current directory). Pins are under `<path>/.pinly/` and `<path>/<child>/.pinly/`.
- `--help`, `-h` — Show help.

## Examples

```bash
pinly add --title "Bun" https://bun.sh
pinly add --dir ./my-app --title "API" https://api.example.com
  pinly list
  pinly list 1
  pinly list "api"
pinly open 1
pinly open docs.url
pinly open work-local/wiki.url   # scoped path when listing from parent
pinly add --title "ESS" -c       # URL from clipboard (avoids shell escaping long URLs)
pinly rm 1
pinly rm ess.url
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
