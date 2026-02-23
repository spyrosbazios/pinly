import { join } from "path";
import { resolveDir } from "./dir";
import { loadListEntries } from "./list";
import { parseUrlFile } from "./url";
import { writeClipboard } from "./clipboard";

const DEFAULT_PIN_DIR = ".pinly";

export async function runCp(args: { dir?: string; target: string }): Promise<void> {
  const baseDir = resolveDir(args.dir ?? process.cwd());
  const target = args.target.trim();

  let url: string;

  const id = parseInt(target, 10);
  if (!Number.isNaN(id) && id >= 1) {
    const entries = await loadListEntries(args.dir ?? process.cwd());
    const entry = entries.find((e) => e.id === id);
    if (!entry) {
      console.error(`pinly cp: no pin with id ${id}`);
      process.exit(1);
    }
    url = entry.url;
  } else {
    let resolvedPath: string;
    if (target.startsWith(".pinly")) {
      resolvedPath = join(baseDir, target);
    } else if (target.includes("/")) {
      const [scope, ...rest] = target.split("/");
      resolvedPath = join(baseDir, scope, DEFAULT_PIN_DIR, rest.join("/"));
    } else {
      resolvedPath = join(baseDir, DEFAULT_PIN_DIR, target);
    }
    const exists = await Bun.file(resolvedPath).exists();
    if (!exists) {
      console.error(`pinly cp: not found: ${target}`);
      process.exit(1);
    }
    const content = await Bun.file(resolvedPath).text();
    url = parseUrlFile(content).url;
  }

  if (!url) {
    console.error("pinly cp: no URL in pin");
    process.exit(1);
  }

  const ok = await writeClipboard(url);
  if (!ok) {
    console.error("pinly cp: could not write to clipboard (pbcopy on macOS, xclip/xsel on Linux)");
    process.exit(1);
  }
  console.log("URL copied to clipboard.");
}
