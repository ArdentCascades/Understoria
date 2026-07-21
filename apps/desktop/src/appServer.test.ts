import { describe, expect, it } from "vitest";
import path from "node:path";
import {
  buildCsp,
  extractInlineScriptHashes,
  mimeFor,
  resolveAppPath,
} from "./appServer.js";

const ROOT = path.join(path.sep, "opt", "understoria", "web-dist");

describe("resolveAppPath", () => {
  it("serves real asset paths as files", () => {
    const r = resolveAppPath("/assets/index-abc123.js", ROOT);
    expect(r.kind).toBe("file");
    expect(r.filePath).toBe(path.join(ROOT, "assets", "index-abc123.js"));
  });

  it("falls back to index.html for extensionless SPA routes", () => {
    for (const route of ["/", "/calendar", "/post/abc", "/project/x/task/y"]) {
      const r = resolveAppPath(route, ROOT);
      expect(r.kind).toBe("fallback");
      expect(r.filePath).toBe(path.join(ROOT, "index.html"));
    }
  });

  it("serves index.html itself as a file", () => {
    const r = resolveAppPath("/index.html", ROOT);
    expect(r.kind).toBe("file");
    expect(r.filePath).toBe(path.join(ROOT, "index.html"));
  });

  it("refuses path traversal, encoded or plain", () => {
    for (const evil of [
      "/../../etc/passwd",
      "/%2e%2e/%2e%2e/etc/passwd",
      "/assets/../../../etc/shadow",
      "/..%2f..%2fetc%2fpasswd",
    ]) {
      const r = resolveAppPath(evil, ROOT);
      // Either the traversal collapses inside the root (harmless) or
      // we fall back — the resolved path must never escape the root.
      expect(
        r.filePath === path.join(ROOT, "index.html") ||
          r.filePath.startsWith(ROOT + path.sep),
      ).toBe(true);
      expect(r.filePath.includes("..")).toBe(false);
    }
  });

  it("falls back on malformed percent-encoding instead of throwing", () => {
    const r = resolveAppPath("/%E0%A4%A", ROOT);
    expect(r.kind).toBe("fallback");
  });
});

describe("mimeFor", () => {
  it("maps the bundle's file types", () => {
    expect(mimeFor("/x/index.html")).toContain("text/html");
    expect(mimeFor("/x/a.js")).toContain("text/javascript");
    expect(mimeFor("/x/a.css")).toContain("text/css");
    expect(mimeFor("/x/icon.svg")).toBe("image/svg+xml");
    expect(mimeFor("/x/icon-512.png")).toBe("image/png");
    expect(mimeFor("/x/manifest.webmanifest")).toContain("manifest+json");
    expect(mimeFor("/x/font.woff2")).toBe("font/woff2");
  });

  it("defaults to octet-stream for unknown extensions", () => {
    expect(mimeFor("/x/file.xyz")).toBe("application/octet-stream");
  });
});

describe("extractInlineScriptHashes", () => {
  it("hashes inline scripts and skips src scripts", () => {
    const html = [
      "<script>var a = 1;</script>",
      '<script type="module" src="/assets/index.js"></script>',
      "<script >var b = 2;</script>",
    ].join("\n");
    const hashes = extractInlineScriptHashes(html);
    expect(hashes).toHaveLength(2);
    for (const h of hashes) expect(h).toMatch(/^'sha256-[A-Za-z0-9+/]+=*'$/);
  });

  it("is stable for identical content", () => {
    const html = "<script>console.log(1)</script>";
    expect(extractInlineScriptHashes(html)).toEqual(
      extractInlineScriptHashes(html),
    );
  });

  it("returns nothing for empty or script-free html", () => {
    expect(extractInlineScriptHashes("<p>hi</p>")).toEqual([]);
    expect(extractInlineScriptHashes("<script></script>")).toEqual([]);
  });
});

describe("buildCsp", () => {
  const csp = buildCsp(["'sha256-abc'"]);

  it("never allows unsafe-inline scripts", () => {
    const scriptSrc = csp
      .split("; ")
      .find((d) => d.startsWith("script-src"))!;
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain("'sha256-abc'");
    expect(scriptSrc).not.toContain("unsafe-inline");
  });

  it("allows any http(s) connect target (member-configured LAN nodes)", () => {
    const connect = csp.split("; ").find((d) => d.startsWith("connect-src"))!;
    expect(connect).toContain("http:");
    expect(connect).toContain("https:");
  });

  it("locks down objects, frames, and form posts", () => {
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'none'");
  });
});
