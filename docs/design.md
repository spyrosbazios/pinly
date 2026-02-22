# Design (PoC)

## Goals

- **Project-local:** Pins live under `.pinly/` next to code; can be committed per project.
- **Simple:** One pin = one `.url` file with title + URL. No tags, no groups in PoC.
- **Bun-native:** Recursive discovery via `Bun.Glob("**/*.url").scan()` under each `.pinly/` root.

## Scope of list

- List shows pins from the **base directory’s** `.pinly/` and from **direct children’s** `.pinly/` only (one level). This lets e.g. `pinly list` from home show pins in `~/work-local/.pinly` without crawling all of `~/work-local/repos/...`.

## Storage format

- Standard `[InternetShortcut]` with `URL=` and optional `TITLE=`.
- Filename = slug from title; collisions get `-2`, `-3`, etc.

## Commands

- **add** — Normalize URL (add `https://` if missing), slugify title, write one `.url` file.
- **list** — Resolve base dir → collect .pinly roots (base + direct children) → glob `**/*.url` in each → parse, sort, optional filter, output table or JSON.
- **open** — By numeric id (from list) or by path (supports scoped paths like `work-local/wiki.url`). Opens URL in default browser via `open` (macOS).

## Dependencies

- **Bun** only. No fzf or other external tools.
