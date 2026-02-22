# Usage & behavior

## Where pins are stored

- Pins live under **`.pinly/`** in a directory you choose (default: current directory).
- `pinly add` writes to `<dir>/.pinly/<slug>.url`. The slug is derived from the title (lowercase, hyphens).

## How `pinly list` works

- **Base directory** is the current directory (or `--dir <path>`).
- Pins are collected from:
  1. **`<base>/.pinly/`** — the base directory’s own pins (recursive under this folder).
  2. **`<base>/<child>/.pinly/`** — for each **direct child** of `<base>` that has a `.pinly` directory (one level only; no deeper).
- So from home (`~`), you see pins in `~/.pinly` and in `~/work-local/.pinly`, but not in `~/work-local/repos/...`.
- Pins from a child directory are shown with a **scoped path** in the list, e.g. `work-local/wiki.url`.

## Opening pins

- **By id:** `pinly open 1` — uses the id from `pinly list` (same base directory).
- **By path:**
  - `pinly open wiki.url` — opens `<base>/.pinly/wiki.url`.
  - `pinly open work-local/wiki.url` — opens `<base>/work-local/.pinly/wiki.url`.

## Filtering

- `pinly list "query"` filters the listed pins by substring match on title, URL, or path.
