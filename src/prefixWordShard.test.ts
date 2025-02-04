import { describe, it, expect } from "@jest/globals";

import { PrefixWordShard } from "./prefixWordShard";

describe("prefixWordShard", () => {
  it("should return matching documents for an exact match", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument("a", "hello world");
    shard.updateDocument("b", "hello mars");
    shard.updateDocument("c", "salve helios");

    const documents = Array.from(shard.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining(["a", "b", "c"]));
  });

  it("should return matching documents for an prefix match", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument("a", "hello world");
    shard.updateDocument("b", "hello mars");
    shard.updateDocument("c", "salve helios");

    const documents = Array.from(shard.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining(["a", "b", "c"]));
  });

  it("should return no documents when there is no match", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument("a", "hello world");
    shard.updateDocument("b", "hello mars");
    shard.updateDocument("c", "salve helios");

    const documents = Array.from(shard.getMatchingDocuments("help"));
    expect(documents).toEqual([]);
  });

  it("should return all word positions for a prefix match", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument("a", "hello world hello helios");
    shard.updateDocument("b", "mars");

    const documents = Array.from(shard.getMatchingDocuments("he"));
    expect(documents).toEqual(["a"]);

    const positions = Array.from(shard.getMatchingInstances("he", "a"));
    expect(positions).toEqual(
      expect.arrayContaining([
        ["hello", 0, 0],
        ["hello", 12, 12],
        ["helios", 18, 18],
      ])
    );
  });

  it("should have a null initial first/last word", () => {
    const shard = new PrefixWordShard();

    expect(shard.firstWord).toBeNull();
    expect(shard.lastWord).toBeNull();
  });

  it("should update the first/last word on the first add", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument("a", "mars");

    expect(shard.firstWord).toEqual("mars");
    expect(shard.lastWord).toEqual("mars");
  });

  it("should update the first word when a new word is added", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument("a", "mars");
    shard.updateDocument("b", "earth");

    expect(shard.firstWord).toEqual("earth");
    expect(shard.lastWord).toEqual("mars");
  });

  it("should update the last word when a new word is added", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument("a", "mars");
    shard.updateDocument("b", "venus");

    expect(shard.firstWord).toEqual("mars");
    expect(shard.lastWord).toEqual("venus");
  });
});
