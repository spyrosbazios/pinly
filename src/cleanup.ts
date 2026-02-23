import { rmSync } from "fs";
import { createInterface } from "readline";
import { resolveDir } from "./dir";
import { getPinlyScopes } from "./list";

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => rl.question(message, resolve));
  rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

export async function runCleanup(args: { dir?: string; force?: boolean }): Promise<void> {
  const baseDir = resolveDir(args.dir ?? process.cwd());
  const scopes = getPinlyScopes(baseDir);

  if (scopes.length === 0) {
    console.log("No .pinly directories found.");
    return;
  }

  console.log("The following .pinly directories will be removed:");
  for (const { pinlyDir, scope } of scopes) {
    const label = scope ? `${baseDir}/${scope}/.pinly` : `${baseDir}/.pinly`;
    console.log(`  ${label}`);
  }
  console.log("");

  if (!args.force) {
    const ok = await confirm("Remove these directories and all pins? [y/N] ");
    if (!ok) {
      console.log("Aborted.");
      return;
    }
  }

  for (const { pinlyDir } of scopes) {
    rmSync(pinlyDir, { recursive: true });
    console.log(`Removed ${pinlyDir}`);
  }
}
