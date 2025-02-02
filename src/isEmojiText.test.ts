import { describe, it, expect } from "@jest/globals";

import { isEmojiText } from "./isEmojiText";

describe("isEmojiText", () => {
  it("should be false for english text", () => {
    expect(isEmojiText("hello world")).toBeFalsy();
    expect(isEmojiText("hello world", true)).toBeFalsy();
  });

  it("should be false when there is non-emoji text before", () => {
    expect(isEmojiText("a❤️")).toBeFalsy();
    expect(isEmojiText("a❤️", true)).toBeFalsy();
  });

  it("should be false when there is non-emoji text after", () => {
    expect(isEmojiText("❤️a")).toBeFalsy();
    expect(isEmojiText("❤️a", true)).toBeFalsy();
  });

  it("should be true for emojis with the variation selector", () => {
    expect(isEmojiText("❤️")).toBeTruthy();
    expect(isEmojiText("❤️", true)).toBeTruthy();
  });

  it("should be true for emojis without the variation selector", () => {
    expect(isEmojiText("❤")).toBeTruthy();
    expect(isEmojiText("❤", true)).toBeTruthy();
  });

  it("should be true for emojis using skin tones", () => {
    expect(isEmojiText("👍🏽")).toBeTruthy();
    expect(isEmojiText("👍🏽", true)).toBeTruthy();
  });

  it("should be true for emojis combined with zero-width joiners", () => {
    // heart + variation selector + zwj + bandage
    expect(isEmojiText("❤️‍🩹")).toBeTruthy();
    expect(isEmojiText("❤️‍🩹", true)).toBeTruthy();
  });

  it("should be true for multiple emojis", () => {
    expect(isEmojiText("❤️👍🏽")).toBeTruthy();
    expect(isEmojiText("❤️👍🏽", true)).toBeTruthy();
  });

  it("should be true when a non-recognized combination of emojis are used", () => {
    const emojiParts = ["❤", "\uFE0F", "\u200D", "🍅"];
    const str = emojiParts.join("");
    expect(isEmojiText(str)).toBeTruthy();
  });

  it("should be false when a non-recognized combination of emojis are used and recognized-only is requested", () => {
    const emojiParts = ["❤", "\uFE0F", "\u200D", "🍅"];
    const str = emojiParts.join("");
    expect(isEmojiText(str, true)).toBeFalsy();
  });
});
