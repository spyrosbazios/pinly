import { mkdirSync } from "fs";
import { join } from "path";
import { resolveDir } from "./dir";
import { formatUrlFile, resolveCollision, slugify, type UrlPin } from "./url";

const DEFAULT_PIN_DIR = ".pinly";

export function normalizeUrl(input: string): string {
  const s = input.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

export async function runAdd(args: { dir?: string; title: string; url: string }): Promise<void> {
  const baseDir = resolveDir(args.dir ?? process.cwd());
  const pinlyDir = join(baseDir, DEFAULT_PIN_DIR);
  const url = normalizeUrl(args.url);
  if (!url.startsWith("http")) {
    console.error("pinly add: invalid URL");
    process.exit(1);
  }
  const slug = slugify(args.title);
  mkdirSync(pinlyDir, { recursive: true });
  const filePath = resolveCollision(pinlyDir, slug);
  const pin: UrlPin = { url, title: args.title };
  await Bun.write(filePath, formatUrlFile(pin));
  console.log(`Created ${filePath}`);
}
