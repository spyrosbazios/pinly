# Design (PoC)

## Goals

- **Project-local:** Pins live under `.pinly/` next to code; can be committed per project.
- **Simple:** One pin = one `.url` file with title + URL. No tags, no groups in PoC.
- **Bun-native:** Recursive discovery via `Bun.Glob("**/*.url").scan()` under each `.pinly/` root.

## Scope of list

- List shows pins from the **base directory’s** `.pinly/` and from **direct children’s** `.pinly/` only (one level). So from home you can see pins in `~/.pinly` and `~/projects/.pinly` without crawling deeper (e.g. `~/projects/repos/...`).

## Storage format

- Standard `[InternetShortcut]` with `URL=` and optional `TITLE=`.
- Filename = slug from title; collisions get `-2`, `-3`, etc.

## Commands

- **add** — Normalize URL (add `https://` if missing), slugify title, write one `.url` file. Optional `--from-clipboard` to read URL from clipboard.
- **ls** (alias **list**) — Resolve base dir → collect .pinly roots (base + direct children) → glob `**/*.url` in each → parse, sort, optional filter. Table (URLs truncated) or `pinly ls <id>` for full details. `--json` for machine output.
- **open** — By numeric id (from ls) or by path (supports scoped paths like `my-project/docs.url`). Opens URL in default browser via `open` (macOS).
- **cp** — Copy pin URL to clipboard by id or path (pbcopy / xclip / xsel).
- **rm** — Remove a pin by id or path (deletes the `.url` file).
- **cleanup** — Remove all `.pinly` dirs under base (same scope as ls). Prompts for confirmation unless `--force`.

## Dependencies

- **Bun** only. No fzf or other external tools.
