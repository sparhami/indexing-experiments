import { describe, it, expect } from "@jest/globals";

import { PrefixWordIndex } from "./prefixWordIndex";

describe("prefixWordIndex", () => {
  it("should return matching documents for an exact match", () => {
    const index = new PrefixWordIndex();
    index.addStringToIndex("a", "hello world");
    index.addStringToIndex("b", "hello mars");
    index.addStringToIndex("c", "salve helios");

    const documents = Array.from(index.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining(["a", "b", "c"]));
  });

  it("should return matching documents for an prefix match", () => {
    const index = new PrefixWordIndex();
    index.addStringToIndex("a", "hello world");
    index.addStringToIndex("b", "hello mars");
    index.addStringToIndex("c", "salve helios");

    const documents = Array.from(index.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining(["a", "b", "c"]));
  });

  it("should return no documents when there is no match", () => {
    const index = new PrefixWordIndex();
    index.addStringToIndex("a", "hello world");
    index.addStringToIndex("b", "hello mars");
    index.addStringToIndex("c", "salve helios");

    const documents = Array.from(index.getMatchingDocuments("help"));
    expect(documents).toEqual([]);
  });

  it("should return all word positions for a prefix match", () => {
    const index = new PrefixWordIndex();
    index.addStringToIndex("a", "hello world hello helios");
    index.addStringToIndex("b", "mars");

    const documents = Array.from(index.getMatchingDocuments("he"));
    expect(documents).toEqual(["a"]);

    const positions = Array.from(index.getMatchingInstances("he", "a"));
    expect(positions).toEqual(
      expect.arrayContaining([
        ["hello", 0, 0],
        ["hello", 12, 12],
        ["helios", 18, 18],
      ])
    );
  });
});
