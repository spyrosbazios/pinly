#!/usr/bin/env bun
import { ui } from "@rezi-ui/core";
import { createNodeApp } from "@rezi-ui/node";
import { loadListEntries, type ListEntry } from "./list";
import { runOpen } from "./open";
import { resolveDir } from "./dir";

const FOOTER_HINT = "↑/↓ navigate · Enter open · q quit";

type State = {
  entries: ListEntry[];
  dir: string;
};

function parseTuiArgs(argv: string[]): string {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir" || argv[i] === "-d") {
      const val = argv[i + 1];
      return val ? resolveDir(val) : process.cwd();
    }
  }
  return process.cwd();
}

const baseDir = parseTuiArgs(process.argv.slice(2));
const initialEntries = await loadListEntries(baseDir);

const initialState: State = {
  entries: initialEntries,
  dir: baseDir,
};

const app = createNodeApp<State>({
  initialState,
  config: { executionMode: "inline" },
});

app.view((state) => {
  const listContent =
    state.entries.length === 0
      ? ui.text("No pins.", { style: { dim: true } })
      : ui.virtualList({
          id: "pins",
          items: state.entries,
          renderItem: (entry: ListEntry, _index: number, focused: boolean) =>
            ui.text(
              focused ? `> ${entry.title}` : `  ${entry.title}`,
              {
                key: String(entry.id),
                style: focused ? { bold: true } : {},
              }
            ),
          onSelect: (entry: ListEntry) => {
            runOpen({ dir: state.dir, target: String(entry.id) });
          },
        });

  return ui.appShell({
    header: ui.text("pinly", { style: { bold: true } }),
    body: ui.focusTrap(
      {
        id: "main",
        active: true,
        initialFocus: "pins",
      },
      [ui.box({ p: 1, border: "none" }, [listContent])]
    ),
    footer: ui.text(FOOTER_HINT, { style: { dim: true } }),
  });
});

app.keys({
  q: () => app.stop(),
});

await app.run();
