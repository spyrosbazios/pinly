/**
 * Parse and write .url (InternetShortcut) files.
 * Optional TITLE= for display; URL= is required.
 */

export interface UrlPin {
  url: string;
  title?: string;
}

export function parseUrlFile(content: string): UrlPin {
  const url = content.match(/^URL=(.+)$/m)?.[1]?.trim() ?? "";
  const title = content.match(/^TITLE=(.+)$/m)?.[1]?.trim();
  return { url, title: title || undefined };
}

export function formatUrlFile(pin: UrlPin): string {
  const lines = ["[InternetShortcut]", `URL=${pin.url}`];
  if (pin.title) lines.push(`TITLE=${pin.title}`);
  return lines.join("\n") + "\n";
}

/** Slug for filename: lowercase, spaces/special -> hyphens, strip leading/trailing hyphens */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "pin";
}

import { existsSync } from "fs";
import { join } from "path";

/** Find next available path: name.url, name-2.url, name-3.url, ... */
export function resolveCollision(baseDir: string, baseName: string, ext = ".url"): string {
  let candidate = join(baseDir, `${baseName}${ext}`);
  if (!existsSync(candidate)) return candidate;
  let n = 2;
  do {
    candidate = join(baseDir, `${baseName}-${n}${ext}`);
    n++;
  } while (existsSync(candidate));
  return candidate;
}
