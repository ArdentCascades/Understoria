/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. Defense-in-depth: without one, any render
 * throw (e.g. a rules-of-hooks violation on an async-hydrating page)
 * unmounts the entire React tree and leaves a blank white screen with
 * no way back. This catches the throw, shows a calm recovery card, and
 * offers a reload — the member keeps a way out even when a page is
 * broken.
 *
 * Deliberately NOT translated: it must render even if i18n or context
 * providers are the thing that failed, so it depends on nothing but
 * React itself. Copy is short, plain, and English-only by design.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (typeof console !== "undefined" && console.error) {
      console.error("[understoria] uncaught render error", error, info);
    }
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            maxWidth: "32rem",
            margin: "4rem auto",
            padding: "0 1.5rem",
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1.5,
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
            Something went wrong on this screen
          </h1>
          <p style={{ marginBottom: "1.25rem" }}>
            Your data is safe — it is stored on this device and was not
            affected. Reloading usually clears this.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid currentColor",
              background: "transparent",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Reload Understoria
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
