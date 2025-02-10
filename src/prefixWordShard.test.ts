import { describe, it, expect } from "@jest/globals";

import { PrefixWordShard } from "./prefixWordShard";
import { DocumentId } from "./indexTypes";

describe("prefixWordShard", () => {
  const docIdA = "idA" as DocumentId;
  const docIdB = "idB" as DocumentId;
  const docIdC = "idC" as DocumentId;

  it("should return matching documents for an exact match", async () => {
    const shard = new PrefixWordShard();
    shard.updateDocument(docIdA, "hello world");
    shard.updateDocument(docIdB, "hello mars");
    shard.updateDocument(docIdC, "salve helios");

    const documents = Array.from(await shard.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining([docIdA, docIdB, docIdC]));
  });

  it("should return matching documents for an prefix match", async () => {
    const shard = new PrefixWordShard();
    shard.updateDocument(docIdA, "hello world");
    shard.updateDocument(docIdB, "hello mars");
    shard.updateDocument(docIdC, "salve helios");

    const documents = Array.from(await shard.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining([docIdA, docIdB, docIdC]));
  });

  it("should return no documents when there is no match", async () => {
    const shard = new PrefixWordShard();
    shard.updateDocument(docIdA, "hello world");
    shard.updateDocument(docIdB, "hello mars");
    shard.updateDocument(docIdC, "salve helios");

    const documents = Array.from(await shard.getMatchingDocuments("help"));
    expect(documents).toEqual([]);
  });

  it("should return all word positions for a prefix match", async () => {
    const shard = new PrefixWordShard();
    shard.updateDocument(docIdA, "hello world hello helios");
    shard.updateDocument(docIdB, "mars");

    const documents = Array.from(await shard.getMatchingDocuments("he"));
    expect(documents).toEqual([docIdA]);

    const positions = Array.from(
      await shard.getMatchingInstances("he", docIdA)
    );
    expect(positions).toEqual(
      expect.arrayContaining([
        ["hello", { codepointIndex: 0, wordIndex: 0 }],
        ["hello", { codepointIndex: 12, wordIndex: 2 }],
        ["helios", { codepointIndex: 18, wordIndex: 3 }],
      ])
    );
  });

  it("should remove entries when updating the same document", async () => {
    const shard = new PrefixWordShard();
    shard.updateDocument(docIdA, "hello world");
    shard.updateDocument(docIdA, "the quick brown fox");

    // No matches for the first update.
    {
      const documents = Array.from(await shard.getMatchingDocuments("he"));
      expect(documents).toEqual([]);
    }

    // Matches for the second update
    {
      const documents = Array.from(await shard.getMatchingDocuments("brown"));
      expect(documents).toEqual([docIdA]);
    }
  });

  it("should have a null initial first/last word", () => {
    const shard = new PrefixWordShard();

    expect(shard.firstWord).toBeNull();
    expect(shard.lastWord).toBeNull();
  });

  it("should update the first/last word on the first add", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument(docIdA, "mars");

    expect(shard.firstWord).toEqual("mars");
    expect(shard.lastWord).toEqual("mars");
  });

  it("should update the first word when a new word is added", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument(docIdA, "mars");
    shard.updateDocument(docIdB, "earth");

    expect(shard.firstWord).toEqual("earth");
    expect(shard.lastWord).toEqual("mars");
  });

  it("should update the last word when a new word is added", () => {
    const shard = new PrefixWordShard();
    shard.updateDocument(docIdA, "mars");
    shard.updateDocument(docIdB, "venus");

    expect(shard.firstWord).toEqual("mars");
    expect(shard.lastWord).toEqual("venus");
  });
});
