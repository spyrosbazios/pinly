import { resolve } from "path";

/** Resolve target directory (default cwd). No git requirement for PoC. */
export function resolveDir(dir: string): string {
  return resolve(process.cwd(), dir);
}
