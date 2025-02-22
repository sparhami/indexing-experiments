import { describe, it, expect } from "@jest/globals";

import { LocalPrefixWordShard } from "./localPrefixWordShard";
import { PrefixWordIndex } from "./prefixWordIndex";
import { DocumentId } from "./indexTypes";

class TestShard extends LocalPrefixWordShard {
  declare _firstWord: string | null;
  declare _lastWord: string | null;
}

describe("prefixWordIndex", () => {
  const docIdA = "idA" as DocumentId;
  const docIdB = "idB" as DocumentId;
  const docIdC = "idC" as DocumentId;

  it("should return matching documents for a single shard", async () => {
    const index = new PrefixWordIndex();
    const shard = new TestShard();

    shard.updateDocument(docIdA, "hello world");
    shard.updateDocument(docIdB, "hello mars");
    index.addShard(shard);

    const documents = Array.from(await index.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining([docIdA, docIdB]));
  });

  it("should return matching documents for multiple shards", async () => {
    const index = new PrefixWordIndex();
    const shardOne = new TestShard();
    const shardTwo = new TestShard();

    shardOne.updateDocument(docIdA, "hello");
    shardOne.updateDocument(docIdB, "hello");
    shardTwo.updateDocument(docIdC, "hey");
    index.addShard(shardOne);
    index.addShard(shardTwo);

    const documents = Array.from(await index.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining([docIdA, docIdB, docIdC]));
  });

  it("should return matching documents for overlapping shards", async () => {
    const index = new PrefixWordIndex();
    const shardOne = new TestShard();
    const shardTwo = new TestShard();

    shardOne.updateDocument(docIdA, "hello world");
    shardOne.updateDocument(docIdB, "hello mars");
    shardTwo.updateDocument(docIdC, "hey venus");
    index.addShard(shardOne);
    index.addShard(shardTwo);

    const documents = Array.from(await index.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining([docIdA, docIdB, docIdC]));
  });

  it("should add words to shards that cover the words", async () => {
    const index = new PrefixWordIndex();
    const shardOne = new TestShard();
    const shardTwo = new TestShard();

    shardOne._firstWord = "apple";
    shardOne._lastWord = "peach";
    shardTwo._firstWord = "pear";
    shardTwo._lastWord = "ugli";

    index.addShard(shardOne);
    index.addShard(shardTwo);
    index.updateDocument(docIdA, "beet sloe melon tomato");
    index.updateDocument(docIdB, "beet tomato");

    const dOneFromShard = Array.from(await shardOne.getMatchingDocuments("be"));
    expect(dOneFromShard).toEqual(expect.arrayContaining([docIdA, docIdB]));
    const dOneFromIndex = Array.from(await index.getMatchingDocuments("be"));
    expect(dOneFromIndex).toEqual(expect.arrayContaining([docIdA, docIdB]));
    const dTwoFromShard = Array.from(await shardTwo.getMatchingDocuments("to"));
    expect(dTwoFromShard).toEqual(expect.arrayContaining([docIdA, docIdB]));
    const dTwoFromIndex = Array.from(await index.getMatchingDocuments("to"));
    expect(dTwoFromIndex).toEqual(expect.arrayContaining([docIdA, docIdB]));
  });

  it("should add words and expand shards if needed", async () => {
    const index = new PrefixWordIndex();
    const shardOne = new TestShard();
    const shardTwo = new TestShard();

    shardOne._firstWord = "b";
    shardOne._lastWord = "c";
    shardTwo._firstWord = "d";
    shardTwo._lastWord = "e";

    index.addShard(shardOne);
    index.addShard(shardTwo);

    // Check that we can add a value before the first shard.
    {
      index.updateDocument(docIdA, "a");

      expect(shardOne.firstWord).toEqual("a");
      const docs = Array.from(await shardOne.getMatchingDocuments("a"));
      expect(docs).toEqual(expect.arrayContaining([docIdA]));
    }

    // Check that we can add a value after the first shard, but before the second.
    {
      index.updateDocument(docIdB, "ca");

      expect(shardTwo.firstWord).toEqual("ca");
      const docs = Array.from(await shardTwo.getMatchingDocuments("ca"));
      expect(docs).toEqual(expect.arrayContaining([docIdB]));
    }

    // Check that we can add a value after the second shard.
    {
      index.updateDocument(docIdC, "f");

      expect(shardTwo.lastWord).toEqual("f");
      const docs = Array.from(await shardTwo.getMatchingDocuments("f"));
      expect(docs).toEqual(expect.arrayContaining([docIdC]));
    }
  });
});
