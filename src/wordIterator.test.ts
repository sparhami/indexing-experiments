import { describe, it, expect } from "@jest/globals";

import { wordIterator } from "./wordIterator";

describe("exactWordSearch", () => {
  it("should split on space", () => {
    const iter = wordIterator("hello world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0 },
      { text: "world", utf16Index: 6, codePointIndex: 6 },
    ]);
  });

  it("should split on multiple spaces", () => {
    const iter = wordIterator("hello  world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0 },
      { text: "world", utf16Index: 7, codePointIndex: 7 },
    ]);
  });

  it("should split on newlines spaces", () => {
    const iter = wordIterator("hello\nworld");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0 },
      { text: "world", utf16Index: 6, codePointIndex: 6 },
    ]);
  });

  it("should handle a single word", () => {
    const iter = wordIterator("hello");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0 },
    ]);
  });

  it("should handle an empty string", () => {
    const iter = wordIterator("");
    const res = Array.from(iter);

    expect(res).toMatchObject([]);
  });

  it("should handle a whitespace only string", () => {
    const iter = wordIterator("  ");
    const res = Array.from(iter);

    expect(res).toMatchObject([]);
  });

  it("should give the correct utf16/codepoint indexes", () => {
    const iter = wordIterator("hello 💙 world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0 },
      { text: "💙", utf16Index: 6, codePointIndex: 6 },
      { text: "world", utf16Index: 9, codePointIndex: 8 },
    ]);
  });
});
