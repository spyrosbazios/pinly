# Pinly

**Project-local bookmarks as code.** Store URLs alongside your projects in `.url` files under `.pinly/` directories. Track them with git, share them with your team, and keep your bookmarks where they belong — next to your code.

No tags. No groups. No external services. Just one pin = one title + URL.

## Why Pinly?

- **Project-scoped**: Bookmarks live in your project's `.pinly/` directory
- **Git-trackable**: `.url` files are plain text — commit them, diff them, review them
- **Fast CLI**: Add, list, open, and manage pins from your terminal
- **UGLY TUI**: Interactive dashboard powered by [Rezi](https://rezitui.dev)
- **Clipboard integration**: Quick copy/paste workflows
- **Fuzzy search**: Find pins by title or URL

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime

### Install globally

```bash
git clone https://github.com/yourusername/pinly.git
cd pinly
bun install
bun link
```

After linking, `pinly` is available globally:

```bash
pinly --help
```

### Run without installing

```bash
bun src/cli.ts <command> [options]
```

## Quick Start

```bash
# Add a bookmark
pinly add --title "Bun Docs" https://bun.sh/docs

# List all pins in current directory
pinly ls

# Open a pin by ID
pinly open 1

# Copy URL to clipboard
pinly cp 1

# Remove a pin
pinly rm 1

# Launch the interactive TUI
pinly tui
```

## Commands

| Command   | Description                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------- |
| `add`     | Create a new pin. Use `--title` and a URL, or `--from-clipboard` / `-c` to read URL from clipboard. |
| `ls`      | List all pins. Optional `[query]` filter. Use `--json` for machine-readable output.                 |
| `open`    | Open pin in default browser by ID or path (e.g., `docs.url`).                                       |
| `rm`      | Remove a pin by ID or path.                                                                         |
| `cp`      | Copy pin's URL to clipboard by ID or path.                                                          |
| `cleanup` | Remove all `.pinly` directories (with confirmation). Use `--force` to skip confirmation.            |
| `tui`     | Launch interactive dashboard. Navigate with ↑/↓, open with Enter, quit with `q`.                    |

## Global Options

| Option               | Description                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `--dir`, `-d <path>` | Base directory (default: current directory). Searches `<path>/.pinly/` and `<path>/<child>/.pinly/`. |
| `--help`, `-h`       | Show help for any command.                                                                           |

## Usage Examples

### Adding pins

```bash
# Add with URL argument
pinly add --title "React Docs" https://react.dev

# Add from clipboard
# (copy a URL first)
pinly add --title "API Reference" --from-clipboard
pinly add -t "API Reference" -c  # shorthand

# Add to specific project
pinly add --dir ./my-app --title "GitHub" https://github.com
```

### Listing and searching

```bash
# List all pins
pinly ls

# Get full details for a specific pin
pinly ls 1

# Filter by text (searches titles and URLs)
pinly ls "api"
pinly ls "github.com"

# JSON output for scripts
pinly ls --json
```

### Opening and copying

```bash
# Open by ID
pinly open 1

# Open by filename
pinly open react-docs.url

# Copy URL to clipboard
pinly cp 1
```

### Cleaning up

```bash
# Remove all .pinly directories (prompts first)
pinly cleanup

# Force cleanup without confirmation
pinly cleanup --force
```

### Using the TUI

```bash
# Launch dashboard
pinly tui

# TUI for specific directory
pinly tui --dir ./my-app
```

**TUI Controls:**

- ↑/↓ — Navigate pins
- Enter — Open selected pin
- q — Quit

## Storage Format

Each pin is a standard `[InternetShortcut]` file stored in `.pinly/<slug>.url`:

```ini
[InternetShortcut]
URL=https://example.com
TITLE=My title
```

This format is:

- ✅ Human-readable
- ✅ Git-friendly (text-based, diffable)
- ✅ Compatible with other tools
- ✅ Portable across systems

### Directory structure

```
my-project/
├── .pinly/
│   ├── bun-docs.url
│   ├── react-docs.url
│   └── api-reference.url
├── src/
└── package.json
```

## Multi-project Support

Pinly can manage pins across multiple projects from a parent directory:

```bash
# From parent directory
cd ~/projects

# Lists pins from all child projects
pinly ls

# Open by path
pinly open my-project/bun-docs.url
```

## Development

```bash
# Install dependencies
bun install

# Run CLI in dev mode with hot reload
bun run dev:cli

# Run TUI in dev mode
bun run dev

# Type check
bun run typecheck
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- [Bun](https://bun.sh) — Fast JavaScript runtime
- [Rezi](https://rezitui.dev) — Terminal UI framework

---
