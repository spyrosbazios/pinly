#!/usr/bin/env bun
import { ui } from "@rezi-ui/core";
import { createNodeApp } from "@rezi-ui/node";
import { filterEntries, loadListEntries, type ListEntry } from "./list";
import { runOpen } from "./open";
import { resolveDir } from "./dir";
import { runAdd, normalizeUrl } from "./add";

const FOOTER_HINT = "Enter to open · ! to create · q to quit";

type ModalState =
  | { type: "none" }
  | { type: "askUrl"; title: string }
  | { type: "askTitle"; url: string };

type State = {
  entries: ListEntry[];
  dir: string;
  query: string;
  modal: ModalState;
  modalInput: string;
};

function looksLikeUrl(s: string): boolean {
  return s.includes(".") || s.includes("/") || s.startsWith("http");
}

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
  modal: { type: "none" },
  modalInput: "",
};

const app = createNodeApp<State>({
  initialState,
  config: { executionMode: "inline" },
});

app.view((state) => {
  const query = state.query.trim();
  const displayedEntries = query
    ? filterEntries(state.entries, query)
    : state.entries;

  const listContent =
    displayedEntries.length === 0
      ? ui.box(
          {
            title: "No pins found",
            border: "rounded",
            p: 2,
            alignSelf: "center",
          },
          [
            ui.empty("Hit ! to create a new pin", {
              description: "",
              icon: "ui.expand",
              action: ui.button({
                id: "create",
                p: 2,
                label: "Create a new pin",
              }),
            }),
          ],
        )
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
        dsSize: "lg",
      }),
    ]),
  ]);

  const resultsSection = ui.box({ p: 1, border: "none" }, [listContent]);

  const mainContent = ui.appShell({
    header: ui.text("pinly", { style: { bold: true } }),
    body: ui.focusTrap(
      {
        id: "main",
        active: state.modal.type === "none",
        initialFocus: "search",
      },
      [ui.column({ gap: 1 }, [filterSection, resultsSection])],
    ),
    footer: ui.text(FOOTER_HINT, { style: { dim: true } }),
  });

  // Modal layer
  if (state.modal.type === "none") {
    return mainContent;
  }

  const closeModal = () =>
    app.update((s) => ({ ...s, modal: { type: "none" }, modalInput: "" }));

  const createPin = async (title: string, url: string) => {
    await runAdd({ dir: state.dir, title, url });
    const newEntries = await loadListEntries(state.dir);
    app.update((s) => ({
      ...s,
      entries: newEntries,
      query: "",
      modal: { type: "none" },
      modalInput: "",
    }));
  };

  const handleModalSubmit = () => {
    if (state.modal.type === "askUrl") {
      createPin(state.modal.title, normalizeUrl(state.modalInput));
    } else if (state.modal.type === "askTitle") {
      createPin(state.modalInput.trim() || "Untitled", state.modal.url);
    }
  };

  const modalTitle =
    state.modal.type === "askUrl"
      ? `Enter URL for "${state.modal.title}"`
      : "Enter pin title";

  const modalPlaceholder =
    state.modal.type === "askUrl" ? "https://..." : "Pin name...";

  const modalContent = ui.modal({
    id: "create-pin-modal",
    title: modalTitle,
    content: ui.input({
      id: "modal-input",
      value: state.modalInput,
      onInput: (value) => app.update((s) => ({ ...s, modalInput: value })),
      placeholder: modalPlaceholder,
    }),
    actions: [
      ui.button({
        id: "submit-btn",
        label: "Create",
        intent: "primary",
        onPress: handleModalSubmit,
      }),
      ui.button({ id: "cancel-btn", label: "Cancel", onPress: closeModal }),
    ],
    onClose: closeModal,
    initialFocus: "modal-input",
    returnFocusTo: "search",
  });

  return ui.layers({}, [mainContent, modalContent]);
});

app.keys({
  q: (ctx) => {
    if (ctx.state.modal.type === "none") {
      app.stop();
    }
  },
  escape: (ctx) => {
    if (ctx.state.modal.type !== "none") {
      app.update((s) => ({ ...s, modal: { type: "none" }, modalInput: "" }));
    }
  },
  "!": (ctx) => {
    // if (ctx.state.modal.type !== "none") return;
    // if (ctx.focusedId !== "search") return;

    const { query, entries, dir } = ctx.state;
    const trimmed = query.trim();
    if (!trimmed) return;

    const filtered = filterEntries(entries, trimmed);

    if (filtered.length > 0) {
      runOpen({ dir, target: String(filtered[0].id) });
      return;
    }

    if (looksLikeUrl(trimmed)) {
      ctx.update((s) => ({
        ...s,
        modal: { type: "askTitle", url: normalizeUrl(trimmed) },
        modalInput: "",
      }));
    } else {
      ctx.update((s) => ({
        ...s,
        modal: { type: "askUrl", title: trimmed },
        modalInput: "",
      }));
    }
  },
});

await app.run();
