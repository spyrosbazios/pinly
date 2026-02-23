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

/** Write text to clipboard. Uses pbcopy (macOS) or xclip/xsel (Linux). */
export async function writeClipboard(text: string): Promise<boolean> {
  const platform = process.platform;
  const writeStdin = (proc: ReturnType<typeof Bun.spawn>) => {
    const stdin = proc.stdin as NodeJS.WritableStream;
    stdin.write(text);
    stdin.end();
  };
  if (platform === "darwin") {
    const proc = Bun.spawn(["pbcopy"], { stdin: "pipe" });
    writeStdin(proc);
    await proc.exited;
    return proc.exitCode === 0;
  }
  if (platform === "linux") {
    try {
      const proc = Bun.spawn(["xclip", "-selection", "clipboard"], { stdin: "pipe" });
      writeStdin(proc);
      await proc.exited;
      if (proc.exitCode === 0) return true;
    } catch {
      //
    }
    try {
      const proc = Bun.spawn(["xsel", "--clipboard", "--input"], { stdin: "pipe" });
      writeStdin(proc);
      await proc.exited;
      return proc.exitCode === 0;
    } catch {
      //
    }
  }
  return false;
}
