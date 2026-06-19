/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { isValidElement } from "react";
import { describe, expect, it } from "vitest";

import { linkify } from "./linkify";

// Narrow a node to an <a> element and surface its props for assertions.
function asAnchor(node: React.ReactNode): {
  href: string;
  target: string;
  rel: string;
  text: string;
} {
  if (!isValidElement(node)) {
    throw new Error("expected a React element");
  }
  const props = node.props as {
    href: string;
    target: string;
    rel: string;
    children: string;
  };
  expect(node.type).toBe("a");
  return {
    href: props.href,
    target: props.target,
    rel: props.rel,
    text: props.children,
  };
}

describe("linkify", () => {
  it("returns plain text as a single string node when there is no URL", () => {
    const result = linkify("just a plain comment, nothing to click");
    expect(result).toEqual(["just a plain comment, nothing to click"]);
  });

  it("splits one URL into [before, <a>, after]", () => {
    const result = linkify("see https://example.com/foo here");
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("see ");
    const a = asAnchor(result[1]);
    expect(a.href).toBe("https://example.com/foo");
    expect(a.text).toBe("https://example.com/foo");
    expect(result[2]).toBe(" here");
  });

  it("returns alternating segments for multiple URLs", () => {
    const result = linkify("a https://one.test b http://two.test c");
    expect(result).toHaveLength(5);
    expect(result[0]).toBe("a ");
    expect(asAnchor(result[1]).href).toBe("https://one.test");
    expect(result[2]).toBe(" b ");
    expect(asAnchor(result[3]).href).toBe("http://two.test");
    expect(result[4]).toBe(" c");
  });

  it("trims trailing punctuation from the match and leaves it in the text", () => {
    const result = linkify("see https://example.com/foo.");
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("see ");
    const a = asAnchor(result[1]);
    expect(a.href).toBe("https://example.com/foo");
    expect(a.text).toBe("https://example.com/foo");
    // The sentence-ending period stays as plain text.
    expect(result[2]).toBe(".");
  });

  it("trims a run of trailing punctuation, e.g. a parenthesised URL", () => {
    const result = linkify("(https://example.com/x).");
    expect(result[0]).toBe("(");
    expect(asAnchor(result[1]).href).toBe("https://example.com/x");
    expect(result[2]).toBe(").");
  });

  it("does NOT linkify bare domains without a scheme", () => {
    const result = linkify("see example.com and www.foo.com for details");
    expect(result).toEqual(["see example.com and www.foo.com for details"]);
  });

  it("opens links in a new tab with noopener noreferrer", () => {
    const result = linkify("https://example.com");
    const a = asAnchor(result[0]);
    expect(a.target).toBe("_blank");
    expect(a.rel).toBe("noopener noreferrer");
  });
});
