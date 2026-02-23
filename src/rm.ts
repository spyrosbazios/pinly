import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { resolveDir } from "./dir";
import { loadListEntries } from "./list";

const DEFAULT_PIN_DIR = ".pinly";

function resolveTargetPath(baseDir: string, target: string): string | null {
  const id = parseInt(target, 10);
  if (!Number.isNaN(id) && id >= 1) {
    return null; // caller will resolve by id
  }
  if (target.startsWith(".pinly")) {
    return join(baseDir, target);
  }
  if (target.includes("/")) {
    const [scope, ...rest] = target.split("/");
    return join(baseDir, scope, DEFAULT_PIN_DIR, rest.join("/"));
  }
  return join(baseDir, DEFAULT_PIN_DIR, target);
}

export async function runRm(args: { dir?: string; target: string }): Promise<void> {
  const baseDir = resolveDir(args.dir ?? process.cwd());
  const target = args.target.trim();

  let filePath: string;

  const pathFromTarget = resolveTargetPath(baseDir, target);
  if (pathFromTarget !== null) {
    if (!existsSync(pathFromTarget)) {
      console.error(`pinly rm: not found: ${target}`);
      process.exit(1);
    }
    filePath = pathFromTarget;
  } else {
    const id = parseInt(target, 10);
    const entries = await loadListEntries(args.dir ?? process.cwd());
    const entry = entries.find((e) => e.id === id);
    if (!entry) {
      console.error(`pinly rm: no pin with id ${id}`);
      process.exit(1);
    }
    filePath = entry.path;
  }

  unlinkSync(filePath);
  console.log(`Removed ${filePath}`);
}
