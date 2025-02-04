import { describe, it, expect } from "@jest/globals";

import { PrefixWordShard } from "./prefixWordShard";
import { PrefixWordIndex } from "./prefixWordIndex";

class TestShard extends PrefixWordShard {
  declare _firstWord: string | null;
  declare _lastWord: string | null;
}

describe("prefixWordIndex", () => {
  it("should return matching documents for a single shard", () => {
    const index = new PrefixWordIndex();
    const shard = new TestShard();

    shard.updateDocument("idA", "hello world");
    shard.updateDocument("idB", "hello mars");
    index.addShard(shard);

    const documents = Array.from(index.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining(["idA", "idB"]));
  });

  it("should return matching documents for multiple shards", () => {
    const index = new PrefixWordIndex();
    const shardOne = new TestShard();
    const shardTwo = new TestShard();

    shardOne.updateDocument("idA", "hello");
    shardOne.updateDocument("idB", "hello");
    shardTwo.updateDocument("idC", "hey");
    index.addShard(shardOne);
    index.addShard(shardTwo);

    const documents = Array.from(index.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining(["idA", "idB", "idC"]));
  });

  it("should return matching documents for overlapping shards", () => {
    const index = new PrefixWordIndex();
    const shardOne = new TestShard();
    const shardTwo = new TestShard();

    shardOne.updateDocument("idA", "hello world");
    shardOne.updateDocument("idB", "hello mars");
    shardTwo.updateDocument("idC", "hey venus");
    index.addShard(shardOne);
    index.addShard(shardTwo);

    const documents = Array.from(index.getMatchingDocuments("he"));
    expect(documents).toEqual(expect.arrayContaining(["idA", "idB", "idC"]));
  });

  it("should add words to shards that cover the words", () => {
    const index = new PrefixWordIndex();
    const shardOne = new TestShard();
    const shardTwo = new TestShard();

    shardOne._firstWord = "apple";
    shardOne._lastWord = "peach";
    shardTwo._firstWord = "pear";
    shardTwo._lastWord = "ugli";

    index.addShard(shardOne);
    index.addShard(shardTwo);
    index.updateDocument("idA", "beet sloe melon tomato");
    index.updateDocument("idB", "beet tomato");

    const dOneFromShard = Array.from(shardOne.getMatchingDocuments("be"));
    expect(dOneFromShard).toEqual(expect.arrayContaining(["idA", "idB"]));
    const dOneFromIndex = Array.from(index.getMatchingDocuments("be"));
    expect(dOneFromIndex).toEqual(expect.arrayContaining(["idA", "idB"]));
    const dTwoFromShard = Array.from(shardTwo.getMatchingDocuments("to"));
    expect(dTwoFromShard).toEqual(expect.arrayContaining(["idA", "idB"]));
    const dTwoFromIndex = Array.from(index.getMatchingDocuments("to"));
    expect(dTwoFromIndex).toEqual(expect.arrayContaining(["idA", "idB"]));
  });

  it.only("should add words and expand shards if needed", () => {
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
      index.updateDocument("idA", "a");

      expect(shardOne.firstWord).toEqual("a");
      const docs = Array.from(shardOne.getMatchingDocuments("a"));
      expect(docs).toEqual(expect.arrayContaining(["idA"]));
    }

    // Check that we can add a value after the first shard, but before the second.
    {
      index.updateDocument("idB", "ca");

      expect(shardTwo.firstWord).toEqual("ca");
      const docs = Array.from(shardTwo.getMatchingDocuments("ca"));
      expect(docs).toEqual(expect.arrayContaining(["idB"]));
    }

    // Check that we can add a value after the second shard.
    {
      index.updateDocument("idC", "f");

      expect(shardTwo.lastWord).toEqual("f");
      const docs = Array.from(shardTwo.getMatchingDocuments("f"));
      expect(docs).toEqual(expect.arrayContaining(["idC"]));
    }
  });
});
