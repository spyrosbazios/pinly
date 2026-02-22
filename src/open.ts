import { join } from "path";
import { resolveDir } from "./dir";
import { loadListEntries } from "./list";
import { parseUrlFile } from "./url";

const DEFAULT_PIN_DIR = ".pinly";

async function getUrlByPath(filePath: string): Promise<string> {
  const content = await Bun.file(filePath).text();
  const { url } = parseUrlFile(content);
  return url;
}

export async function runOpen(args: { dir?: string; target: string }): Promise<void> {
  const baseDir = resolveDir(args.dir ?? process.cwd());
  const target = args.target.trim();

  let url: string;

  const id = parseInt(target, 10);
  if (Number.isNaN(id) || id < 1) {
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
      console.error(`pinly open: not found: ${target}`);
      process.exit(1);
    }
    url = await getUrlByPath(resolvedPath);
  } else {
    const entries = await loadListEntries(args.dir ?? process.cwd());
    const entry = entries.find((e) => e.id === id);
    if (!entry) {
      console.error(`pinly open: no pin with id ${id}`);
      process.exit(1);
    }
    url = entry.url;
  }

  if (!url) {
    console.error("pinly open: no URL in pin");
    process.exit(1);
  }

  Bun.spawn(["open", url], { stdio: ["inherit", "inherit", "inherit"] });
}
