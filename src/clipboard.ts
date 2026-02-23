/** Read clipboard content. Uses pbpaste (macOS) or xclip/xsel (Linux). */
export async function readClipboard(): Promise<string> {
  const platform = process.platform;
  if (platform === "darwin") {
    const proc = Bun.spawn(["pbpaste"], { stdout: "pipe" });
    const out = await new Response(proc.stdout).text();
    await proc.exited;
    return out.trim();
  }
  if (platform === "linux") {
    try {
      const proc = Bun.spawn(["xclip", "-o", "-selection", "clipboard"], { stdout: "pipe" });
      const out = await new Response(proc.stdout).text();
      await proc.exited;
      if (proc.exitCode === 0) return out.trim();
    } catch {
      // xclip not found or failed
    }
    try {
      const proc = Bun.spawn(["xsel", "--clipboard", "--output"], { stdout: "pipe" });
      const out = await new Response(proc.stdout).text();
      await proc.exited;
      if (proc.exitCode === 0) return out.trim();
    } catch {
      // xsel not found or failed
    }
  }
  return "";
}
