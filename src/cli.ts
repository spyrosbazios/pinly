#!/usr/bin/env bun
const COMMANDS = ["add", "list", "open", "rm"] as const;

function parseArgs(argv: string[]): { command: string; args: Record<string, string | boolean>; positional: string[] } {
  const args: Record<string, string | boolean> = {};
  const positional: string[] = [];
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      i++;
    } else if (arg === "--dir" || arg === "-d") {
      args.dir = argv[i + 1] ?? "";
      i += 2;
    } else if (arg === "--title" || arg === "-t") {
      args.title = argv[i + 1] ?? "";
      i += 2;
    } else if (arg === "--json") {
      args.json = true;
      i++;
    } else if (arg === "--from-clipboard" || arg === "-c") {
      args.fromClipboard = true;
      i++;
    } else if (arg.startsWith("-")) {
      i++;
    } else {
      positional.push(arg);
      i++;
    }
  }
  const command = positional[0] ?? "";
  return { command, args, positional: positional.slice(1) };
}

function printHelp(cmd?: string): void {
  const help: Record<string, string> = {
    "": `pinly – project-local bookmarks (.pinly/*.url)

Usage: pinly <command> [options] [args]

Commands:
  add     Add a pin (requires --title and URL or --from-clipboard)
  list    List pins (optional query filter)
  open    Open a pin by id or path
  rm      Remove a pin by id or path

Options (global):
  --dir, -d <path>   Target directory (default: cwd). Pins live under <dir>/.pinly/
  --help, -h         Show this help

Examples:
  pinly add --title "Docs" https://example.com
  pinly add --dir ./project --title "API" https://api.example.com
  pinly add --title "ESS" --from-clipboard   # URL from clipboard
  pinly list
  pinly list 1
  pinly list "api"
  pinly open 1
  pinly open docs.url
  pinly rm 1
  pinly rm ess.url
`,
    add: `pinly add – add a pin

Usage: pinly add [--dir <path>] --title <title> [<url> | --from-clipboard]

  --title, -t <title>      Display title (required). Used for filename slug.
  --dir, -d <path>         Directory to add under (default: cwd). Pin is written to <dir>/.pinly/<slug>.url
  --from-clipboard, -c     Use URL from clipboard (macOS: pbpaste, Linux: xclip/xsel).

Provide either <url> or --from-clipboard. URL is normalized (https:// added if missing).
`,
    list: `pinly list – list pins recursively under .pinly/

Usage: pinly list [--dir <path>] [id | query]

  id      Show full details of one pin (id from list).
  query   Optional filter (matches title, url, or path). Omit id to filter.
  --json  Output JSON array (or single object when id given).
`,
    open: `pinly open – open a pin in default browser

Usage: pinly open [--dir <path>] <id | path>

  id     Numeric id from "pinly list".
  path   Relative path to .url file, e.g. docs.url or subdir/doc.url
`,
    rm: `pinly rm – remove a pin

Usage: pinly rm [--dir <path>] <id | path>

  id     Numeric id from "pinly list".
  path   Relative path to .url file, e.g. ess.url or work-local/wiki.url
`,
  };
  console.log(help[cmd ?? ""] ?? help[""]);
}

async function main(): Promise<void> {
  const { command, args, positional } = parseArgs(process.argv.slice(2));

  if (args.help || !command) {
    printHelp(command || undefined);
    process.exit(args.help ? 0 : 1);
  }

  if (!COMMANDS.includes(command as (typeof COMMANDS)[number])) {
    console.error(`pinly: unknown command '${command}'`);
    printHelp();
    process.exit(1);
  }

  if (command === "add") {
    const title = args.title as string | undefined;
    let url = positional[0];
    if (args.fromClipboard) {
      const { readClipboard } = await import("./clipboard");
      url = await readClipboard();
      if (!url) {
        console.error("pinly add: clipboard is empty or unsupported (use pbpaste on macOS, xclip/xsel on Linux)");
        process.exit(1);
      }
      if (/\s/.test(url)) {
        console.error("pinly add: clipboard content doesn't look like a URL (copy the URL from your browser, not the command)");
        process.exit(1);
      }
    }
    if (!title || !url) {
      console.error("pinly add: need --title <title> and <url> (or --from-clipboard / -c)");
      process.exit(1);
    }
    const { runAdd } = await import("./add");
    await runAdd({ dir: args.dir as string | undefined, title, url });
    return;
  }

  if (command === "list") {
    const first = positional[0];
    const id = first != null && /^\d+$/.test(first) ? parseInt(first, 10) : undefined;
    const query = id == null && first != null ? first : undefined;
    const { runList } = await import("./list");
    await runList({
      dir: args.dir as string | undefined,
      query,
      id,
      json: args.json as boolean,
    });
    return;
  }

  if (command === "open") {
    const target = positional[0];
    if (!target) {
      console.error("pinly open: need <id> or <path>");
      process.exit(1);
    }
    const { runOpen } = await import("./open");
    await runOpen({ dir: args.dir as string | undefined, target });
    return;
  }

  if (command === "rm") {
    const target = positional[0];
    if (!target) {
      console.error("pinly rm: need <id> or <path>");
      process.exit(1);
    }
    const { runRm } = await import("./rm");
    await runRm({ dir: args.dir as string | undefined, target });
    return;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
