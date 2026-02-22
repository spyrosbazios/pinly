#!/usr/bin/env bun
const COMMANDS = ["add", "list", "open"] as const;

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
  add     Add a pin (requires --title and URL)
  list    List pins (optional query filter)
  open    Open a pin by id or path

Options (global):
  --dir, -d <path>   Target directory (default: cwd). Pins live under <dir>/.pinly/
  --help, -h         Show this help

Examples:
  pinly add --title "Docs" https://example.com
  pinly add --dir ./project --title "API" https://api.example.com
  pinly list
  pinly list "api"
  pinly open 1
  pinly open docs.url
`,
    add: `pinly add – add a pin

Usage: pinly add [--dir <path>] --title <title> <url>

  --title, -t <title>   Display title (required). Used for filename slug.
  --dir, -d <path>      Directory to add under (default: cwd). Pin is written to <dir>/.pinly/<slug>.url

URL is normalized (https:// added if missing).
`,
    list: `pinly list – list pins recursively under .pinly/

Usage: pinly list [--dir <path>] [query]

  query   Optional filter (matches title, url, or path).
  --json  Output JSON array.
`,
    open: `pinly open – open a pin in default browser

Usage: pinly open [--dir <path>] <id | path>

  id     Numeric id from "pinly list".
  path   Relative path to .url file, e.g. docs.url or subdir/doc.url
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
    const url = positional[0];
    if (!title || !url) {
      console.error("pinly add: need --title <title> and <url>");
      process.exit(1);
    }
    const { runAdd } = await import("./add");
    await runAdd({ dir: args.dir as string | undefined, title, url });
    return;
  }

  if (command === "list") {
    const { runList } = await import("./list");
    await runList({
      dir: args.dir as string | undefined,
      query: positional[0],
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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
