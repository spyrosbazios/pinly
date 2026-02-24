#!/usr/bin/env bun
import { ui } from "@rezi-ui/core";
import { createNodeApp } from "@rezi-ui/node";
import { filterEntries, loadListEntries, type ListEntry } from "./list";
import { runOpen } from "./open";
import { resolveDir } from "./dir";
import { readClipboard } from "./clipboard";
import { runAdd, normalizeUrl } from "./add";

const FOOTER_HINT =
  "Tab filter/list · ! add (title from search, URL from clipboard) · Enter open · a add when in list · q quit";

type State = {
  entries: ListEntry[];
  dir: string;
  query: string;
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
  query: "",
};

const app = createNodeApp<State>({
  initialState,
  config: { executionMode: "inline" },
});

app.view((state) => {
  const displayedEntries = state.query.trim()
    ? filterEntries(state.entries, state.query.trim())
    : state.entries;

  const listContent =
    displayedEntries.length === 0
      ? ui.text("No pins.", { style: { dim: true } })
      : ui.virtualList({
          id: "pins",
          items: displayedEntries,
          renderItem: (entry: ListEntry, _index: number, focused: boolean) =>
            ui.text(focused ? `> ${entry.title}` : `  ${entry.title}`, {
              key: String(entry.id),
              style: focused ? { bold: true } : {},
            }),
          onSelect: (entry: ListEntry) => {
            runOpen({ dir: state.dir, target: String(entry.id) });
          },
        });

  const filterSection = ui.box({ p: 1, border: "none" }, [
    ui.row({ gap: 1 }, [
      ui.input({
        id: "search",
        value: state.query,
        onInput: (value) => app.update((s) => ({ ...s, query: value })),
        placeholder: "Filter by title, URL, or path…",
      }),
    ]),
  ]);

  const resultsSection = ui.box({ p: 1, border: "none" }, [listContent]);

  return ui.appShell({
    header: ui.text("pinly", { style: { bold: true } }),
    body: ui.focusTrap(
      {
        id: "main",
        active: true,
        initialFocus: "search",
      },
      [ui.column({ gap: 1 }, [filterSection, resultsSection])],
    ),
    footer: ui.text(FOOTER_HINT, { style: { dim: true } }),
  });
});

function doAddFromState(ctx: {
  state: State;
  update: (u: (s: State) => State) => void;
}) {
  const { dir, query } = ctx.state;
  const title = query.trim() || "Untitled";
  (async () => {
    const raw = (await readClipboard()).trim();
    if (!raw || /\s/.test(raw)) return;
    const url = normalizeUrl(raw);
    if (!url.startsWith("http")) return;
    try {
      await runAdd({ dir, title, url });
      const newEntries = await loadListEntries(dir);
      ctx.update((s) => ({ ...s, entries: newEntries, query: "" }));
    } catch {
      // runAdd failed (e.g. write error)
    }
  })();
}

app.keys({
  q: () => app.stop(),
  "!": (ctx) => doAddFromState(ctx),
  a: (ctx) => {
    if (ctx.focusedId === "search") return; // let "a" type in search
    doAddFromState(ctx);
  },
});

await app.run();
