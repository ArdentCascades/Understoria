/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  decodeMessageBody,
  encodeMessageBody,
} from "./messageEnvelope";

describe("encodeMessageBody", () => {
  it("returns the bare string when there is no post reference", () => {
    expect(encodeMessageBody("hello there")).toBe("hello there");
    expect(encodeMessageBody("hello", undefined)).toBe("hello");
  });

  it("returns a v1 JSON envelope when a post reference is present", () => {
    const encoded = encodeMessageBody("can I help?", "post-9");
    expect(JSON.parse(encoded)).toEqual({
      v: 1,
      text: "can I help?",
      aboutPostId: "post-9",
    });
  });

  it("round-trips through decode", () => {
    const body = decodeMessageBody(encodeMessageBody("hi", "post-1"));
    expect(body).toEqual({ text: "hi", aboutPostId: "post-1" });
    const plain = decodeMessageBody(encodeMessageBody("hi"));
    expect(plain).toEqual({ text: "hi" });
  });
});

describe("decodeMessageBody", () => {
  it("treats a bare legacy string as text", () => {
    expect(decodeMessageBody("just words")).toEqual({ text: "just words" });
  });

  it("falls back to raw text on malformed JSON", () => {
    const raw = '{"v":1,"text":';
    expect(decodeMessageBody(raw)).toEqual({ text: raw });
  });

  it("falls back to raw text on JSON that is not an envelope", () => {
    expect(decodeMessageBody('{"foo":1}')).toEqual({ text: '{"foo":1}' });
    expect(decodeMessageBody("[1,2,3]")).toEqual({ text: "[1,2,3]" });
    expect(decodeMessageBody('{"v":"1","text":"x"}')).toEqual({
      text: '{"v":"1","text":"x"}',
    });
    expect(decodeMessageBody('{"v":1,"text":42}')).toEqual({
      text: '{"v":1,"text":42}',
    });
  });

  it("decodes a v1 envelope with and without aboutPostId", () => {
    expect(
      decodeMessageBody('{"v":1,"text":"hi","aboutPostId":"post-2"}'),
    ).toEqual({ text: "hi", aboutPostId: "post-2" });
    expect(decodeMessageBody('{"v":1,"text":"hi"}')).toEqual({ text: "hi" });
  });

  it("ignores an aboutPostId that is not a non-empty string", () => {
    expect(
      decodeMessageBody('{"v":1,"text":"hi","aboutPostId":7}'),
    ).toEqual({ text: "hi" });
    expect(
      decodeMessageBody('{"v":1,"text":"hi","aboutPostId":""}'),
    ).toEqual({ text: "hi" });
  });

  it("surfaces text from unknown future versions (graceful degradation)", () => {
    expect(
      decodeMessageBody('{"v":2,"text":"future words","shiny":true}'),
    ).toEqual({ text: "future words" });
  });
});
