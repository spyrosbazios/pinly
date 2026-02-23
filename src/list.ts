import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { resolveDir } from "./dir";
import { parseUrlFile } from "./url";

const DEFAULT_PIN_DIR = ".pinly";

export interface ListEntry {
  id: number;
  path: string;
  url: string;
  title: string;
  relPath: string;
}

/** Recursively find all .url files under dir/.pinly/ using Bun-native glob (native, lazy iterator). */
async function findUrlFiles(pinlyDir: string): Promise<string[]> {
  const glob = new Bun.Glob("**/*.url");
  const files: string[] = [];
  for await (const f of glob.scan({ cwd: pinlyDir, absolute: true })) {
    files.push(f);
  }
  return files;
}

/** Collect (pinlyDir, scope) for baseDir/.pinly and each direct child dir that has .pinly (one level only, no deeper). */
export function getPinlyScopes(baseDir: string): { pinlyDir: string; scope: string }[] {
  const scopes: { pinlyDir: string; scope: string }[] = [];
  const own = join(baseDir, DEFAULT_PIN_DIR);
  if (existsSync(own)) scopes.push({ pinlyDir: own, scope: "" });
  try {
    for (const name of readdirSync(baseDir, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      const childPinly = join(baseDir, name.name, DEFAULT_PIN_DIR);
      if (existsSync(childPinly)) scopes.push({ pinlyDir: childPinly, scope: name.name });
    }
  } catch {
    // ignore readdir errors (e.g. permission)
  }
  return scopes;
}

export async function loadListEntries(dir: string): Promise<ListEntry[]> {
  const baseDir = resolveDir(dir);
  const scopes = getPinlyScopes(baseDir);
  const raw: { path: string; url: string; title: string; relPath: string }[] = [];

  for (const { pinlyDir, scope } of scopes) {
    const paths = await findUrlFiles(pinlyDir);
    const reads = paths.map(async (path) => {
      const content = await Bun.file(path).text();
      const { url, title } = parseUrlFile(content);
      const fileRel = path.slice(pinlyDir.length + 1);
      const relPath = scope ? `${scope}/${fileRel}` : fileRel;
      const displayTitle = title ?? fileRel.replace(/\.url$/i, "").replace(/[-_]/g, " ");
      return { path, url, title: displayTitle, relPath };
    });
    raw.push(...(await Promise.all(reads)));
  }

  raw.sort((a, b) => a.relPath.localeCompare(b.relPath));
  return raw.map((r, i) => ({ ...r, id: i + 1 }));
}

function filterEntries(entries: ListEntry[], query: string): ListEntry[] {
  const q = query.toLowerCase();
  return entries.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.url.toLowerCase().includes(q) ||
      e.relPath.toLowerCase().includes(q)
  );
}

const URL_TRUNCATE = 48;

function truncateUrl(url: string): string {
  if (url.length <= URL_TRUNCATE) return url;
  return url.slice(0, URL_TRUNCATE - 1) + "…";
}

function formatLine(e: ListEntry): string {
  return `${String(e.id).padStart(4)}  ${e.title.slice(0, 40).padEnd(42)}  ${truncateUrl(e.url)}`;
}

function formatPinDetail(e: ListEntry): string {
  return [
    `id:      ${e.id}`,
    `title:   ${e.title}`,
    `path:    ${e.relPath}`,
    `url:     ${e.url}`,
  ].join("\n");
}

export async function runList(args: {
  dir?: string;
  query?: string;
  id?: number;
  json?: boolean;
}): Promise<void> {
  const entries = await loadListEntries(args.dir ?? process.cwd());

  if (args.id != null) {
    const entry = entries.find((e) => e.id === args.id);
    if (!entry) {
      console.error(`pinly list: no pin with id ${args.id}`);
      process.exit(1);
    }
    if (args.json) {
      console.log(JSON.stringify(entry, null, 2));
    } else {
      console.log(formatPinDetail(entry));
    }
    return;
  }

  const list = args.query ? filterEntries(entries, args.query) : entries;

  if (args.json) {
    console.log(JSON.stringify(list, null, 2));
    return;
  }

  if (list.length === 0) {
    console.log("No pins found.");
    return;
  }

  console.log("  ID  Title                                    URL");
  for (const e of list) console.log(formatLine(e));
}
