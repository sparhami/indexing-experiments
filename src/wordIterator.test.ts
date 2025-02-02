import { describe, it, expect } from "@jest/globals";

import { wordIterator } from "./wordIterator";

describe("wordIterator", () => {
  it("should split on space", () => {
    const iter = wordIterator("hello world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "world", utf16Index: 6, codePointIndex: 6, wordIndex: 1 },
    ]);
  });

  it("should split on multiple spaces", () => {
    const iter = wordIterator("hello  world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "world", utf16Index: 7, codePointIndex: 7, wordIndex: 1 },
    ]);
  });

  it("should split on newlines", () => {
    const iter = wordIterator("hello\nworld");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "world", utf16Index: 6, codePointIndex: 6, wordIndex: 1 },
    ]);
  });

  it("should split on periods", () => {
    const iter = wordIterator("hello. world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "world", utf16Index: 7, codePointIndex: 7, wordIndex: 1 },
    ]);
  });

  it("should split on semicolons", () => {
    const iter = wordIterator("hello; world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "world", utf16Index: 7, codePointIndex: 7, wordIndex: 1 },
    ]);
  });

  it("should segment Japanese text", () => {
    const iter = wordIterator("今日は土曜日です。コーヒーで仕事をする。");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      {
        codePointIndex: 0,
        text: "今日",
        utf16Index: 0,
        wordIndex: 0,
      },
      {
        codePointIndex: 2,
        text: "は",
        utf16Index: 2,
        wordIndex: 1,
      },
      {
        codePointIndex: 3,
        text: "土曜日",
        utf16Index: 3,
        wordIndex: 2,
      },
      {
        codePointIndex: 6,
        text: "です",
        utf16Index: 6,
        wordIndex: 3,
      },
      {
        codePointIndex: 9,
        text: "コーヒー",
        utf16Index: 9,
        wordIndex: 4,
      },
      {
        codePointIndex: 13,
        text: "で",
        utf16Index: 13,
        wordIndex: 5,
      },
      {
        codePointIndex: 14,
        text: "仕事",
        utf16Index: 14,
        wordIndex: 6,
      },
      {
        codePointIndex: 16,
        text: "を",
        utf16Index: 16,
        wordIndex: 7,
      },
      {
        codePointIndex: 17,
        text: "する",
        utf16Index: 17,
        wordIndex: 8,
      },
    ]);
  });

  it("should split on word breaking characters from other languages", () => {
    const iter = wordIterator("hello; world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "world", utf16Index: 7, codePointIndex: 7, wordIndex: 1 },
    ]);
  });

  it("should handle a single word", () => {
    const iter = wordIterator("hello");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
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

  it("should give emojis as words", () => {
    const iter = wordIterator("hello💙world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "💙", utf16Index: 5, codePointIndex: 5, wordIndex: 1 },
      // The 💙 has two code units, so utf16 index differs from code point index.
      { text: "world", utf16Index: 7, codePointIndex: 6, wordIndex: 2 },
    ]);
  });

  it("should give emojis with skin tones as words", () => {
    const iter = wordIterator("hello👍🏽world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "👍🏽", utf16Index: 5, codePointIndex: 5, wordIndex: 1 },
      // Two code points for 👍🏽, the thumb up and color. Those are two code
      // units each, so indexes reflect that.
      { text: "world", utf16Index: 9, codePointIndex: 7, wordIndex: 2 },
    ]);
  });

  it("should give emoji combinations as words", () => {
    const iter = wordIterator("hello❤️‍🩹world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "❤️‍🩹", utf16Index: 5, codePointIndex: 5, wordIndex: 1 },
      // Four code points for ❤️‍🩹, heart + variation selector + ZWJ + bandage
      { text: "world", utf16Index: 10, codePointIndex: 9, wordIndex: 2 },
    ]);
  });

  it("should give multiple emojis as separate words", () => {
    const iter = wordIterator("hello❤🌎world");
    const res = Array.from(iter);

    expect(res).toMatchObject([
      { text: "hello", utf16Index: 0, codePointIndex: 0, wordIndex: 0 },
      { text: "❤", utf16Index: 5, codePointIndex: 5, wordIndex: 1 },
      { text: "🌎", utf16Index: 6, codePointIndex: 6, wordIndex: 2 },
      { text: "world", utf16Index: 8, codePointIndex: 7, wordIndex: 3 },
    ]);
  });
});
