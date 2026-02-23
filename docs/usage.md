# Usage & behavior

## Where pins are stored

- Pins live under **`.pinly/`** in a directory you choose (default: current directory).
- `pinly add` writes to `<dir>/.pinly/<slug>.url`. The slug is derived from the title (lowercase, hyphens).

## Adding from clipboard

- Use **`--from-clipboard`** or **`-c`** when the URL is in the clipboard (e.g. long URLs with `?` or `&` that are awkward to quote in the shell):
  ```bash
  pinly add --title "Docs" -c
  ```
- **macOS:** uses `pbpaste`. **Linux:** uses `xclip -o` or `xsel --clipboard --output`.

## Listing and pin details

- **`pinly ls`** (alias: **`pinly list`**) — Table of all pins. Long URLs are truncated (e.g. to 48 chars) so the table stays readable.
- **`pinly ls <id>`** — Full details for one pin: id, title, path, and full URL (no truncation).
- **`pinly ls "query"`** — Same table, filtered by substring on title, URL, or path (use when the first argument is not a number).

## How `pinly ls` discovers pins

- **Base directory** is the current directory (or `--dir <path>`).
- Pins are collected from:
  1. **`<base>/.pinly/`** — the base directory’s own pins (recursive under this folder).
  2. **`<base>/<child>/.pinly/`** — for each **direct child** of `<base>` that has a `.pinly` directory (one level only; no deeper).
- So from home (`~`), you see pins in `~/.pinly` and in `~/projects/.pinly`, but not in `~/projects/repos/...`.
- Pins from a child directory are shown with a **scoped path** in the list, e.g. `projects/docs.url`.

## Opening pins

- **By id:** `pinly open 1` — uses the id from `pinly ls` (same base directory).
- **By path:**
  - `pinly open docs.url` — opens `<base>/.pinly/docs.url`.
  - `pinly open my-project/docs.url` — opens `<base>/my-project/.pinly/docs.url`.

## Copying URL to clipboard

- **`pinly cp <id>`** — Copy the pin’s URL to the clipboard (e.g. `pinly cp 1`).
- **`pinly cp <path>`** — Same by path, e.g. `docs.url` or `my-project/docs.url`. Uses pbcopy (macOS) or xclip/xsel (Linux).

## Removing pins

- **`pinly rm <id>`** — Remove the pin with that id (from `pinly ls`).
- **`pinly rm <path>`** — Remove by path, e.g. `docs.url` or `my-project/docs.url` (same resolution as `open`).

## Cleanup

- **`pinly cleanup`** — Lists all `.pinly` directories under the base (same scope as `ls`: base and direct children), then prompts **Remove these directories and all pins? [y/N]**. Answer `y` or `yes` to delete them; anything else aborts.
- **`pinly cleanup --force`** / **`-f`** — Same, but skips the confirmation (for scripts).

## Filtering

- `pinly ls "query"` filters the listed pins by substring match on title, URL, or path.
